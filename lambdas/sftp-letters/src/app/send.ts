import type { SftpClient } from '../infra/sftp-client';
import type { UserDataRepository } from '../infra/user-data-repository';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import type { SyntheticBatch } from '../domain/synthetic-batch';
import type { TemplateLockRepository } from '../infra/template-lock-repository';
import { parseTestPersonalisation } from '../domain/test-data';
import { serialiseCsv } from '../infra/serialise-csv';
import { z } from 'zod';
import path from 'node:path';
import { Readable } from 'node:stream';
import type { ProofingRequest } from '../infra/types';

export class App {
  constructor(
    private readonly userDataRepository: UserDataRepository,
    private readonly templateRepository: TemplateLockRepository,
    private readonly sftpEnvironment: string,
    private readonly batch: SyntheticBatch,
    private readonly logger: Logger
  ) {}
  async send(
    eventBody: string,
    messageId: string,
    sftp: SftpClient,
    baseUploadDir: string
  ): Promise<'sent' | 'already-sent' | 'failed'> {
    const {
      owner,
      templateId,
      pdfVersion,
      testDataVersion,
      personalisationParameters,
    } = this.parseProofingRequest(eventBody);

    const batchId = this.batch.getId(templateId, pdfVersion);

    const templateLogger = this.logger.child({
      owner,
      templateId,
      pdfVersion,
      testDataVersion,
      batchId,
      messageId,
    });

    const dest = this.getFileDestinations(baseUploadDir, templateId, batchId);

    templateLogger.info('Fetching user Data');

    try {
      const files = await this.getFileData(
        owner,
        templateId,
        pdfVersion,
        testDataVersion,
        personalisationParameters,
        batchId
      );

      templateLogger.info('Acquiring sender lock');

      const locked = await this.templateRepository.acquireLock(
        owner,
        templateId
      );

      if (!locked) {
        templateLogger.warn(
          'Template is already locked, assuming duplicate event'
        );
        return 'already-sent';
      }

      if (await sftp.exists(dest.manifest)) {
        templateLogger.warn(
          'Manifest already exists, assuming duplicate event'
        );
        await this.templateRepository.finaliseLock(owner, templateId);
        return 'already-sent';
      }

      templateLogger.info('Sending PDF');

      // create directories in sequence to reduce likelihood of simultaneous creation
      await sftp.mkdir(dest.dir.pdf, true);
      await sftp.mkdir(dest.dir.batch, true);

      await sftp.put(files.pdf, dest.pdf);

      templateLogger.info('Sending batch');

      await sftp.put(files.batch, dest.batch);

      templateLogger.info('Sending manifest');

      await sftp.put(files.manifest, dest.manifest);

      templateLogger.info('Removing lock');

      await this.templateRepository.finaliseLock(owner, templateId);

      templateLogger.info('Sent proofing request');

      return 'sent';
    } catch (error) {
      templateLogger
        .child({ description: 'Failed to handle proofing request' })
        .error(error);

      return 'failed';
    }
  }

  private parseProofingRequest(event: string): ProofingRequest {
    return z
      .object({
        owner: z.string(),
        templateId: z.string(),
        pdfVersion: z.string(),
        testDataVersion: z.string().optional(),
        personalisationParameters: z.array(z.string()),
      })
      .parse(JSON.parse(event));
  }

  private async getFileData(
    owner: string,
    templateId: string,
    pdfVersion: string,
    testDataVersion: string | undefined,
    fields: string[],
    batchId: string
  ) {
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

    const batchStream = Readable.from(batchCsv);
    const manifestStream = Readable.from(manifestCsv);

    return {
      batch: batchStream,
      manifest: manifestStream,
      pdf: userData.pdf,
    };
  }

  private getFileDestinations(
    sftpBasePath: string,
    templateId: string,
    batchId: string
  ) {
    const sftpEnvDir = path.join(sftpBasePath, this.sftpEnvironment);

    const templateDir = path.join(sftpEnvDir, 'templates', templateId);
    const batchDir = path.join(sftpEnvDir, 'batches', templateId);

    const pdfName = `${templateId}.pdf`;
    const csvName = `${batchId}.csv`;
    const manifestName = `${batchId}_MANIFEST.csv`;

    const pdfDestination = path.join(templateDir, pdfName);
    const batchDestination = path.join(batchDir, csvName);
    const manifestDestination = path.join(batchDir, manifestName);

    return {
      pdf: pdfDestination,
      batch: batchDestination,
      manifest: manifestDestination,
      dir: {
        pdf: templateDir,
        batch: batchDir,
      },
    };
  }
}
