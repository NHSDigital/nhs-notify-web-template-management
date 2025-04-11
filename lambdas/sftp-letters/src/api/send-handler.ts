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

    for (const [i, res] of results.entries()) {
      if (res.status === 'rejected') {
        const messageId = event.Records[i].messageId;
        batchItemFailures.push({ itemIdentifier: messageId });
      }
    }

    const failureCount = batchItemFailures.length;
    const sentCount = recordCount - failureCount;

    supplierLogger.info({ failureCount, sentCount });

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
