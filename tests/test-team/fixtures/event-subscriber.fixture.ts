import { test as base } from '@playwright/test';
import { EventSubscriber } from '../helpers/events/event-subscriber';

type EventSubscriberFixture = {
  eventSubscriber: EventSubscriber;
};

export const testWithEventSubscriber = base.extend<
  object,
  EventSubscriberFixture
>({
  eventSubscriber: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, workerInfo) => {
      const eventSource = `//notify.nhs.uk/${process.env.COMPONENT}/${process.env.GROUP}/${process.env.ENVIRONMENT}`;

      const subscriber = new EventSubscriber(
        process.env.EVENTS_SNS_TOPIC_ARN,
        process.env.AWS_ACCOUNT_ID,
        process.env.ENVIRONMENT,
        'event',
        'config-publishing',
        eventSource,
        workerInfo.workerIndex
      );

      await subscriber.initialise();

      await use(subscriber).finally(() => subscriber.teardown());
    },
    { scope: 'worker' },
  ],
});

export const { expect } = testWithEventSubscriber;
