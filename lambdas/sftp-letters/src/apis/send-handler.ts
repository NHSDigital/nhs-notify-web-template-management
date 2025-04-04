import { SQSRecord } from 'aws-lambda';
import { UserDataRepository } from '../infra/user-data-repository';
import { SftpSupplierClientRepository } from '../infra/sftp-supplier-client-repository';
import { z } from 'zod';
import { logger } from 'nhs-notify-web-template-management-utils';
import path from 'node:path';

function parseProofingRequest(event: string) {
  return z
    .object({
      owner: z.string(),
      templateId: z.string(),
      pdfVersion: z.string(),
      testDataVersion: z.string().optional(),
    })
    .parse(JSON.parse(event));
}

export function createHandler({
  userDataRepository,
  sftpSupplierClientRepository,
  defaultSupplier,
}: {
  userDataRepository: UserDataRepository;
  sftpSupplierClientRepository: SftpSupplierClientRepository;
  defaultSupplier: string;
}) {
  return async function (records: SQSRecord[]) {
    const { sftpClient, baseUploadDir } =
      await sftpSupplierClientRepository.getClient(defaultSupplier, logger);

    await sftpClient.connect();

    for (const record of records) {
      const request = parseProofingRequest(record.body);

      const streams = await userDataRepository.get(
        request.owner,
        request.templateId,
        request.pdfVersion,
        request.testDataVersion
      );

      if (streams.csv) {
        await sftpClient.put(streams.csv, path.join(baseUploadDir, 'batches'));
      }

      await sftpClient.put(streams.pdf, path.join(baseUploadDir, ''));
    }
  };
}
