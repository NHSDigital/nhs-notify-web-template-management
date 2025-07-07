import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import type { SftpSupplierClientRepository } from '../infra/sftp-supplier-client-repository';
import type { SftpClient } from '../infra/sftp-client';
import type { S3Repository } from 'nhs-notify-web-template-management-utils';

const MAX_SIZE_BYTES = 100 * 1024 * 1024; // 100MB in bytes;

export class App {
  constructor(
    private readonly sftpSupplierClientRepository: SftpSupplierClientRepository,
    private readonly logger: Logger,
    private readonly s3Repository: S3Repository,
    private readonly sftpEnvironment: string
  ) {}

  async poll(supplier: string) {
    const { sftpClient, baseDownloadDir } =
      await this.sftpSupplierClientRepository.getClient(supplier);

    this.logger.info('Polling SFTP');
    await sftpClient.connect();

    this.logger.info(
      `Copying files from folder ${baseDownloadDir}/${this.sftpEnvironment}/proofs to proofs`
    );

    try {
      await this.pollBaseFolder(
        sftpClient,
        `${baseDownloadDir}/${this.sftpEnvironment}/proofs`,
        `proofs/${supplier}`
      );
    } finally {
      await sftpClient.end();
    }

    this.logger.info('Finished polling SFTP');
  }

  private async pollBaseFolder(
    sftpClient: SftpClient,
    baseSftpPath: string,
    baseS3Path: string
  ) {
    this.logger.info({
      description: 'Copying folder',
      baseSftpPath,
      baseS3Path,
    });
    const isDir = await this.isDirectory(sftpClient, baseSftpPath);

    if (!isDir) {
      this.logger.info(`Path '${baseSftpPath}' does not exist`);
      return;
    }

    const templateIdFolders = await sftpClient.list(baseSftpPath);

    for (const templateIdFolder of templateIdFolders) {
      if (templateIdFolder.type === 'd') {
        await this.pollTemplateIdFolder(
          sftpClient,
          baseSftpPath,
          baseS3Path,
          templateIdFolder.name
        );
      } else {
        this.logger.info({
          description: 'Unexpected non-directory item found',
          baseSftpPath,
          templateIdFolder,
        });
      }
    }
  }

  private async isDirectory(sftpClient: SftpClient, path: string) {
    return (await sftpClient.exists(path)) === 'd';
  }

  private async pollTemplateIdFolder(
    sftpClient: SftpClient,
    baseSftpPath: string,
    baseS3Path: string,
    templateId: string
  ) {
    const proofFiles = await sftpClient.list(`${baseSftpPath}/${templateId}`);

    for (const proofFile of proofFiles) {
      if (proofFile.type === '-') {
        await this.copyFileToS3(
          sftpClient,
          `${baseSftpPath}/${templateId}/${proofFile.name}`,
          `${baseS3Path}/${templateId}/${proofFile.name}`
        );
      } else {
        this.logger.info({
          description: 'Unexpected non-file item found',
          baseSftpPath,
          templateId,
          proofFile,
        });
      }
    }
  }

  private async copyFileToS3(
    sftpClient: SftpClient,
    sftpPath: string,
    s3Path: string
  ) {
    this.logger.info({ description: 'Copying file', sftpPath, s3Path });
    try {
      const data = (await sftpClient.get(sftpPath)) as Buffer;

      const fileValidation = await this.validateFile(data);

      if (fileValidation) {
        await this.s3Repository.putRawData(data, s3Path);
      } else {
        this.logger.error({
          description: 'PDF file failed validation',
          sftpPath,
          s3Path,
        });
      }

      await sftpClient.delete(sftpPath);
    } catch (error) {
      this.logger
        .child({ description: 'Failed to process file', sftpPath, s3Path })
        .error(error);
    }
  }

  private async validateFile(buffer: Buffer) {
    return (
      buffer.byteLength > 0 &&
      buffer.byteLength < MAX_SIZE_BYTES &&
      this.isBufferPdf(buffer)
    );
  }

  private isBufferPdf(buffer: Buffer): boolean {
    const pdfBufferStart = [0x25, 0x50, 0x44, 0x46]; // '%PDF'
    return pdfBufferStart.every((byte, index) => buffer[index] === byte);
  }
}
