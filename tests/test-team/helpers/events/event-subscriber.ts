import {
  CreateQueueCommand,
  DeleteMessageBatchCommand,
  DeleteQueueCommand,
  ListQueuesCommand,
  Message,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { setTimeout } from 'node:timers/promises';
import {
  ListSubscriptionsByTopicCommand,
  SNSClient,
  SubscribeCommand,
  UnsubscribeCommand,
} from '@aws-sdk/client-sns';
import { ZodType } from 'zod';

type Event<T> = {
  sentTime: Date;
  record: T extends undefined ? Record<string, unknown> : T;
};

/*
  Class instances must be created as worker-scoped playwright fixtures.
  Each worker owns its queue and subscription and runs tests in serial internally.
  Each fixture should only be used in a single suite.
  The cleanup static method should be called in a suite's global setup.

  This util assumes that the event JSON has a unique 'id' property. Use of
  non-unique IDs will lead to non-deterministic behaviour in tests.

  Receive can be called repeatedly to poll for new events. The same value for
  'since' should be used across polls since this is used to trim cached messages.

  Since by default tests can run in parallel, events triggered by other tests
  may be received. Filtering should be applied or if necessary tests should be run serially.
*/

export class EventSubscriber {
  static readonly sns = new SNSClient({ region: 'eu-west-2' });

  static readonly sqs = new SQSClient({ region: 'eu-west-2' });

  static readonly rootNamespace = 'tm-e2e-es';

  private readonly queueName: string;

  private readonly queueArn: string;

  private readonly queueUrl: string;

  private subscriptionArn: string | undefined = undefined;

  private messages = new Map<
    string,
    { record: Record<string, unknown>; sentTime: Date }
  >();

  constructor(
    private readonly topic: string,
    private readonly account: string,
    private readonly environment: string,
    private readonly suite: string,
    private readonly tag: string,
    private readonly eventSource: string | string[],
    private readonly workerIndex: number
  ) {
    this.queueName = `${EventSubscriber.rootNamespace}-${this.environment}-${this.suite}-${this.tag}-${this.workerIndex}`;
    this.queueArn = `arn:aws:sqs:eu-west-2:${this.account}:${this.queueName}`;
    this.queueUrl = `https://sqs.eu-west-2.amazonaws.com/${this.account}/${this.queueName}`;
  }

  async initialise() {
    await this.createQueue();

    this.subscriptionArn = await this.createSubscription();
  }

  async receive<T = undefined>({
    since,
    match,
  }: {
    since: Date;
    match?: ZodType<T>;
  }): Promise<Event<T>[]> {
    this.trimCached(since);

    const received: Message[] = [];

    let polledCount = 0;

    do {
      const { Messages: polled = [] } = await EventSubscriber.sqs.send(
        new ReceiveMessageCommand({
          QueueUrl: this.queueUrl,
          MaxNumberOfMessages: 10,
          MessageSystemAttributeNames: ['SentTimestamp'],
        })
      );

      polledCount = polled.length;

      if (polledCount) {
        await EventSubscriber.sqs.send(
          new DeleteMessageBatchCommand({
            QueueUrl: this.queueUrl,
            Entries: polled.map((msg, index) => ({
              Id: index.toString(),
              ReceiptHandle: msg.ReceiptHandle!,
            })),
          })
        );
      }

      received.push(...polled);
    } while (polledCount > 0);

    const parsed = received.flatMap(({ Body, Attributes }) => {
      if (Body && Attributes?.SentTimestamp) {
        const sentTime = new Date(Number(Attributes.SentTimestamp));
        const snsEvent = JSON.parse(Body);

        const record = JSON.parse(snsEvent.Message);

        const envelopeId = record.id;

        if (!envelopeId) {
          throw new Error('Event record is missing id field');
        }

        return [{ sentTime, record, envelopeId }];
      }

      return [];
    });

    for (const event of parsed) {
      this.messages.set(event.envelopeId, {
        record: event.record,
        sentTime: event.sentTime,
      });
    }

    const filtered = [...this.messages.values()].filter(({ record }) => {
      const eventTime = record.time ? new Date(record.time as string) : null;
      if (since && eventTime && eventTime <= since) return false;

      if (match) {
        return match.safeParse(record).success;
      }

      return true;
    }) as Event<T>[];

    return filtered.sort((a, b) => a.sentTime.getTime() - b.sentTime.getTime());
  }

  private trimCached(since: Date) {
    for (const [id, { record }] of this.messages) {
      const eventTime = record.time ? new Date(record.time as string) : null;
      if (eventTime && eventTime < since) {
        this.messages.delete(id);
      }
    }
  }

  async teardown() {
    if (this.subscriptionArn) {
      await EventSubscriber.deleteSubscription(this.subscriptionArn);
    }

    await EventSubscriber.deleteQueue(this.queueUrl);
  }

  private async createQueue() {
    console.log(`Creating queue with ARN: ${this.queueArn}`);

    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AllowSnsSendMessage',
          Effect: 'Allow',
          Principal: { Service: 'sns.amazonaws.com' },
          Action: 'sqs:SendMessage',
          Resource: this.queueArn,
          Condition: {
            ArnEquals: {
              'aws:SourceArn': this.topic,
            },
          },
        },
      ],
    };

    let attempt = 0;

    while (attempt < 10) {
      attempt += 1;

      try {
        await EventSubscriber.sqs.send(
          new CreateQueueCommand({
            QueueName: this.queueName,
            Attributes: {
              Policy: JSON.stringify(policy),
            },
          })
        );
        break;
      } catch (error) {
        if (
          error instanceof Error &&
          // error instanceof QueueDeletedRecently does not work as expected
          (error.name === 'QueueDeletedRecently' ||
            ('Code' in error &&
              error.Code === 'AWS.SimpleQueueService.QueueDeletedRecently'))
        ) {
          console.log(
            `Queue deleted recently, retrying creation (attempt ${attempt})`
          );
          await setTimeout(10_000);
        } else {
          throw error;
        }
      }
    }
  }

  private async createSubscription() {
    console.log(
      `Creating SNS subscription (topic: ${this.topic}) (queue: ${this.queueArn})`
    );

    const policy =
      typeof this.eventSource === 'string'
        ? `{ "source": ["${this.eventSource}"] }`
        : `{ "source": ${JSON.stringify(this.eventSource)} }`;

    const subscription = await EventSubscriber.sns.send(
      new SubscribeCommand({
        TopicArn: this.topic,
        Protocol: 'sqs',
        Endpoint: this.queueArn,
        Attributes: {
          FilterPolicyScope: 'MessageBody',
          FilterPolicy: policy,
        },
      })
    );

    return subscription.SubscriptionArn;
  }

  private static deleteQueue(url: string, warn = true) {
    console.log(`Deleting queue with URL: ${url}`);

    return EventSubscriber.sqs
      .send(new DeleteQueueCommand({ QueueUrl: url }))
      .catch((error) => {
        if (warn) {
          console.warn(`Failed to delete queue at ${url}: ${error}`);
        }
      });
  }

  private static deleteSubscription(arn: string) {
    console.log(`Deleting SNS subscription with ARN: ${arn}`);

    return EventSubscriber.sns
      .send(new UnsubscribeCommand({ SubscriptionArn: arn }))
      .catch((error) => {
        console.warn(`Failed to delete subscription with ARN ${arn}: ${error}`);
      });
  }

  static async cleanup(suite: string, environment: string, topicArn: string) {
    const namePrefix = `${EventSubscriber.rootNamespace}-${environment}-${suite}-`;

    const urls: string[] = [];

    let nextQueuesToken: string | undefined;

    do {
      const queues = await EventSubscriber.sqs.send(
        new ListQueuesCommand({
          QueueNamePrefix: namePrefix,
          NextToken: nextQueuesToken,
        })
      );

      nextQueuesToken = queues.NextToken;

      urls.push(...(queues.QueueUrls ?? []));
    } while (nextQueuesToken);

    const subscriptionArns: string[] = [];

    let nextSubscriptionsToken: string | undefined;

    const queueArns = new Set(
      urls.map((url) =>
        url.replace(
          /^https:\/\/sqs\.eu-west-2\.amazonaws\.com\/(\d+)\/([^/]+)$/,
          'arn:aws:sqs:eu-west-2:$1:$2'
        )
      )
    );

    do {
      const subscriptions = await EventSubscriber.sns.send(
        new ListSubscriptionsByTopicCommand({
          TopicArn: topicArn,
          NextToken: nextSubscriptionsToken,
        })
      );

      nextSubscriptionsToken = subscriptions.NextToken;

      const queueSubscriptions =
        subscriptions.Subscriptions?.flatMap(({ SubscriptionArn, Endpoint }) =>
          SubscriptionArn && Endpoint && queueArns.has(Endpoint)
            ? [SubscriptionArn]
            : []
        ) ?? [];

      subscriptionArns.push(...queueSubscriptions);
    } while (nextSubscriptionsToken);

    for (const arn of subscriptionArns) {
      await EventSubscriber.deleteSubscription(arn);
    }

    for (const url of urls) {
      await EventSubscriber.deleteQueue(url);
    }
  }
}
