import type { SftpClient } from '../infra/sftp-client';
import type { UserDataRepository } from '../infra/user-data-repository';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import type { Batch } from '../domain/batch';
import type { TemplateRepository } from '../infra/template-repository';
import { parseTestPersonalisation } from '../domain/test-data';
import { serialiseCsv } from '../infra/serialise-csv';
import { z } from 'zod';
import path from 'node:path';
import { Readable } from 'node:stream';

function parseProofingRequest(event: string) {
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

    const batchId = this.batch.getId(templateId, pdfVersion);

    const templateLogger = this.logger.child({
      owner,
      templateId,
      pdfVersion,
      testDataVersion,
      batchId,
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

    const batchRows = this.batch.buildBatch(templateId, fields, parsedTestData);

    const batchHeader = this.batch.getHeader(fields);

    const batchCsv = await serialiseCsv(batchRows, batchHeader);

    const manifest = this.batch.buildManifest(templateId, batchId, batchCsv);

    const manifestCsv = await serialiseCsv(
      [manifest],
      'template,batch,records,md5sum'
    );

    const sftpEnvDir = path.join(baseUploadDir, this.sftpEnvironment);

    const templateDir = path.join(sftpEnvDir, 'templates', templateId);
    const batchDir = path.join(sftpEnvDir, 'batches', templateId);

    const pdfName = `${templateId}.pdf`;
    const csvName = `${batchId}.csv`;
    const manifestName = `${batchId}_MANIFEST.csv`;

    const pdfDestination = path.join(templateDir, pdfName);
    const batchDestination = path.join(batchDir, csvName);
    const manifestDestination = path.join(batchDir, manifestName);

    const batchStream = Readable.from(batchCsv);
    const manifestStream = Readable.from(manifestCsv);

    templateLogger.info('Updating template to SENDING_PROOF_REQUEST');

    if (await sftpClient.exists(manifestDestination)) {
      templateLogger.warn('Manifest already exists, assuming duplicate event');
      return;
    }

    templateLogger.info('Sending PDF');

    await Promise.all([
      sftpClient.mkdir(templateDir, true),
      sftpClient.mkdir(batchDir, true),
    ]);

    await sftpClient.put(userData.pdf, pdfDestination);

    templateLogger.info('Sending batch');

    await sftpClient.put(batchStream, batchDestination);

    templateLogger.info('Sending manifest');

    await sftpClient.put(manifestStream, manifestDestination);

    templateLogger.info('Updating template to NOT_YET_SUBMITTED');

    await this.templateRepository.updateToNotYetSubmitted(owner, templateId);

    templateLogger.info('Sent proofing request');
  }
}
