import { parseTestPersonalisation } from '../domain/test-data';
import { serialise } from '../infra/serialise-csv';
import { SftpClient } from '../infra/sftp-client';
import type { UserDataRepository } from '../infra/user-data-repository';
import { z } from 'zod';
import path from 'node:path';
import { Readable } from 'node:stream';
import { Logger } from 'nhs-notify-web-template-management-utils';
import { Batch } from '../domain/batch';
import { TemplateRepository } from '../infra/template-repository';

export function parseProofingRequest(event: string) {
  return z
    .object({
      owner: z.string(),
      templateId: z.string(),
      pdfVersion: z.string(),
      testDataVersion: z.string().optional(),
      fields: z.array(z.string()),
    })
    .parse(JSON.parse(event));
}

export class App {
  constructor(
    private readonly userDataRepository: UserDataRepository,
    private readonly templateRepository: TemplateRepository,
    private readonly sftpEnvironment: string,
    private readonly batch: Batch,
    private readonly logger: Logger
  ) {}
  async send(eventBody: string, sftpClient: SftpClient, baseUploadDir: string) {
    const { owner, templateId, pdfVersion, testDataVersion, fields } =
      parseProofingRequest(eventBody);

    const templateLogger = this.logger.child({
      owner,
      templateId,
      pdfVersion,
      testDataVersion,
    });

    templateLogger.info('Fetching user Data');

    const userData = await this.userDataRepository.get(
      owner,
      templateId,
      pdfVersion,
      testDataVersion
    );

    const parsedTestData = userData.testData
      ? parseTestPersonalisation(userData.testData)
      : undefined;

    const batch = this.batch.buildBatch(templateId, fields, parsedTestData);

    const batchLogger = templateLogger.child({ batchId: batch.id });

    const batchCsv = await serialise(batch.rows, batch.header);

    const manifest = this.batch.buildManifest(templateId, batch.id, batchCsv);

    const manifestCsv = await serialise(
      [manifest],
      'template,batch,records,md5'
    );

    batchLogger.info('Sending PDF');

    await sftpClient.put(
      userData.pdf,
      path.join(
        baseUploadDir,
        this.sftpEnvironment,
        'templates',
        `${templateId}.pdf`
      )
    );

    batchLogger.info('Sending batch');

    await sftpClient.put(
      Readable.from(batchCsv),
      path.join(
        baseUploadDir,
        this.sftpEnvironment,
        'batches',
        templateId,
        `${batch.id}.csv`
      )
    );

    batchLogger.info('Sending manifest');

    await sftpClient.put(
      Readable.from(manifestCsv),
      path.join(
        baseUploadDir,
        this.sftpEnvironment,
        'batches',
        templateId,
        `${batch.id}_MANIFEST.csv`
      )
    );

    batchLogger.info('Sent proofing request');
  }
}
