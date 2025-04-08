import type { SftpClient } from '../infra/sftp-client';
import type { UserDataRepository } from '../infra/user-data-repository';
import type { Logger } from 'nhs-notify-web-template-management-utils';
import type { Batch } from '../domain/batch';
import type { TemplateRepository } from '../infra/template-repository';
import { parseTestPersonalisation } from '../domain/test-data';
import { serialise } from '../infra/serialise-csv';
import { z } from 'zod';
import path from 'node:path';
import { Readable } from 'node:stream';

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

    const sftpEnvDir = path.join(baseUploadDir, this.sftpEnvironment);

    const templateDir = path.join(sftpEnvDir, 'templates', templateId);
    const batchDir = path.join(sftpEnvDir, 'batches', templateId);

    const pdfName = `${templateId}.pdf`;
    const csvName = `${batch.id}.csv`;
    const manifestName = `${batch.id}_MANIFEST.csv`;

    const pdfDestination = path.join(templateDir, pdfName);
    const batchDestination = path.join(batchDir, csvName);
    const manifestDestination = path.join(batchDir, manifestName);

    const batchStream = Readable.from(batchCsv);
    const manifestStream = Readable.from(manifestCsv);

    batchLogger.info('Updating template to SENDING_PROOF');

    await this.templateRepository.updateToSendingProof(owner, templateId);

    batchLogger.info('Sending PDF');

    await Promise.all([
      sftpClient.mkdir(templateDir, true),
      sftpClient.mkdir(batchDir, true),
    ]);

    await sftpClient.put(userData.pdf, pdfDestination);

    batchLogger.info('Sending batch');

    await sftpClient.put(batchStream, batchDestination);

    batchLogger.info('Sending manifest');

    await sftpClient.put(manifestStream, manifestDestination);

    batchLogger.info('Updating template to awaiting proof');

    await this.templateRepository.updateToAwaitingProof(owner, templateId);

    batchLogger.info('Sent proofing request');
  }
}
