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

  private async copyFolder(
    sftpClient: SftpClient,
    copyPath: string,
    pastePath: string
  ) {
    const isDir = (await sftpClient.exists(copyPath)) === 'd';

    if (!isDir) {
      this.logger.info(`Path '${copyPath}' does not exist`);
      return;
    }

    const sftpFiles = await sftpClient.list(copyPath);

    for (const sftpFile of sftpFiles) {
      if (sftpFile.type === 'd') {
        this.logger.info({
          description: 'Copying folder',
          copyPath,
          pastePath,
        });
        await this.copyFolder(
          sftpClient,
          `${copyPath}/${sftpFile.name}`,
          `${pastePath}/${sftpFile.name}`
        );
      }

      if (sftpFile.type === '-') {
        this.logger.info({ description: 'Copying file', copyPath, pastePath });
        await this.copyFile(
          sftpClient,
          `${copyPath}/${sftpFile.name}`,
          `${pastePath}/${sftpFile.name}`
        );
      }
    }
  }

  private async validateFile(buffer: Buffer) {
    return (
      buffer.byteLength > 0 &&
      buffer.byteLength < MAX_SIZE_BYTES &&
      this.isBufferPdf(buffer)
    );
  }

  isBufferPdf(buffer: Buffer): boolean {
    const pdfBufferStart = [0x25, 0x50, 0x44, 0x46]; // '%PDF'
    return pdfBufferStart.every((byte, index) => buffer[index] === byte);
  }

  private async copyFile(
    sftpClient: SftpClient,
    copyPath: string,
    pastePath: string
  ) {
    try {
      const data = (await sftpClient.get(copyPath)) as Buffer;

      const fileValidation = await this.validateFile(data);

      if (!fileValidation) {
        this.logger.error('PDF file failed validation', {
          copyPath,
          pastePath,
        });
        return;
      }

      await this.s3Repository.putRawData(data, pastePath);

      await sftpClient.delete(copyPath);
    } catch (error) {
      this.logger.error('Failed to copy file', { copyPath, pastePath, error });
    }
  }

  async poll() {
    const sftpConfigs = await this.sftpSupplierClientRepository.listClients();

    for (const { sftpClient, baseDownloadDir, name } of sftpConfigs) {
      this.logger.info('Polling SFTP');
      await sftpClient.connect();

      this.logger.info(
        `Copying files from folder ${baseDownloadDir} to proofs/${name}`
      );

      await this.copyFolder(
        sftpClient,
        `${baseDownloadDir}/${this.sftpEnvironment}/proofs`,
        'proofs'
      );

      await sftpClient.end();

      this.logger.info('Finished polling SFTP');
    }
  }
}
