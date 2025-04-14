import type { SQSBatchItemFailure, SQSHandler } from 'aws-lambda';
import type { SftpSupplierClientRepository } from '../infra/sftp-supplier-client-repository';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import type { App } from '../app/send';

type Dependencies = {
  app: App;
  sftpSupplierClientRepository: SftpSupplierClientRepository;
  defaultSupplier: string;
  logger: Logger;
};

export function createHandler({
  app,
  sftpSupplierClientRepository,
  defaultSupplier,
  logger,
}: Dependencies): SQSHandler {
  return async function (event) {
    const { sftpClient, baseUploadDir } =
      await sftpSupplierClientRepository.getClient(defaultSupplier);

    const recordCount = event.Records.length;

    const supplierLogger = logger.child({
      supplier: defaultSupplier,
      recordCount,
    });

    supplierLogger.info('Opening SFTP connection');

    await sftpClient.connect();

    supplierLogger.info('Sending proof requests');

    const results = await Promise.allSettled(
      event.Records.map((r) =>
        app.send(r.body, r.messageId, sftpClient, baseUploadDir)
      )
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

    supplierLogger.info(outcomes);

    await sftpClient.end().catch((error) => {
      supplierLogger
        .child({
          description: 'Failed to close SFTP connection',
        })
        .error(error);
    });

    return { batchItemFailures };
  };
}
