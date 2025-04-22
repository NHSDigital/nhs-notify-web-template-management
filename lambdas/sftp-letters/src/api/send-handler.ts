import type { SQSBatchItemFailure, SQSHandler } from 'aws-lambda';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import type { App } from '../app/send';

type Dependencies = {
  app: App;
  logger: Logger;
};

export function createHandler({ app, logger }: Dependencies): SQSHandler {
  return async function (event) {
    const recordCount = event.Records.length;

    logger.info('Sending proof requests', { recordCount });

    const results = await Promise.allSettled(
      event.Records.map((r) => app.send(r.body, r.messageId))
    );

    const batchItemFailures: SQSBatchItemFailure[] = [];

    const outcomes = {
      failed: 0,
      sent: 0,
      'already-sent': 0,
    };

    for (const [i, res] of results.entries()) {
      const messageId = event.Records[i].messageId;

      if (res.status === 'rejected') {
        logger
          .child({
            description: 'Could not process proofing request',
            messageId,
          })
          .error(res.reason);

        batchItemFailures.push({ itemIdentifier: messageId });
        outcomes.failed += 1;
      } else if (res.value === 'failed') {
        batchItemFailures.push({ itemIdentifier: messageId });
        outcomes.failed += 1;
      } else if (res.value === 'already-sent') {
        outcomes['already-sent'] += 1;
      } else {
        outcomes.sent += 1;
      }
    }

    logger.info(outcomes);

    return { batchItemFailures };
  };
}
