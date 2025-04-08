import type { SQSBatchItemFailure, SQSHandler } from 'aws-lambda';
import type { SftpSupplierClientRepository } from '../infra/sftp-supplier-client-repository';
import { type Logger, logger } from 'nhs-notify-web-template-management-utils';
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
  logger: _logger,
}: Dependencies): SQSHandler {
  return async function (event) {
    const { sftpClient, baseUploadDir } =
      await sftpSupplierClientRepository.getClient(defaultSupplier, logger);

    const recordCount = event.Records.length;

    const supplierLogger = logger.child({
      supplier: defaultSupplier,
      recordCount,
    });

    supplierLogger.info('Opening SFTP connection');

    await sftpClient.connect();

    supplierLogger.info('Sending proof requests');

    const results = await Promise.allSettled(
      event.Records.map((r) => app.send(r.body, sftpClient, baseUploadDir))
    );

    const batchItemFailures: SQSBatchItemFailure[] = [];

    for (const [i, res] of results.entries()) {
      if (res.status === 'rejected') {
        batchItemFailures.push({ itemIdentifier: event.Records[i].messageId });
      }
    }

    const failureCount = batchItemFailures.length;
    const sentCount = recordCount - failureCount;

    supplierLogger.info({ failureCount, sentCount });

    await sftpClient.end().catch((error) => {
      supplierLogger.error('Failed to close SFTP connection', error);
    });

    return { batchItemFailures };
  };
}
