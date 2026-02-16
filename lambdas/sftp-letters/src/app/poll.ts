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

    const baseSftpPath = `${baseDownloadDir}/${this.sftpEnvironment}/proofs`;
    const baseS3Path = `proofs/${supplier}`;

    const basePathLogger = this.logger.child({ baseSftpPath, baseS3Path });

    basePathLogger.info('Polling SFTP');
    await sftpClient.connect();

    basePathLogger.info(
      `Copying files from folder ${baseDownloadDir}/${this.sftpEnvironment}/proofs to proofs`
    );

    try {
      await this.pollBaseFolder(
        sftpClient,
        baseSftpPath,
        baseS3Path,
        basePathLogger
      );
    } finally {
      await sftpClient.end();
    }

    basePathLogger.info('Finished polling SFTP');
  }

  private async pollBaseFolder(
    sftpClient: SftpClient,
    baseSftpPath: string,
    baseS3Path: string,
    logger: Logger
  ) {
    logger.info('Copying folder');
    const isDir = await this.isDirectory(sftpClient, baseSftpPath);

    if (!isDir) {
      logger.info(`Base SFTP path does not exist`);
      return;
    }

    const idFolders = await sftpClient.list(baseSftpPath);

    for (const idFolder of idFolders) {
      if (idFolder.type === 'd') {
        await this.pollIdFolder(
          sftpClient,
          baseSftpPath,
          baseS3Path,
          idFolder.name,
          logger
        );
      } else {
        logger.info('Unexpected non-directory item found', {
          supplierReference: idFolder,
        });
      }
    }
  }

  private async isDirectory(sftpClient: SftpClient, path: string) {
    return (await sftpClient.exists(path)) === 'd';
  }

  private getInternalTemplateId(supplierReference: string) {
    return supplierReference.split('_')[2];
  }

  private async pollIdFolder(
    sftpClient: SftpClient,
    baseSftpPath: string,
    baseS3Path: string,
    supplierReference: string,
    logger: Logger
  ) {
    const proofFiles = await sftpClient.list(
      `${baseSftpPath}/${supplierReference}`
    );
    const templateId = this.getInternalTemplateId(supplierReference);
    const idLogger = logger.child({ supplierReference, templateId });

    for (const proofFile of proofFiles) {
      if (proofFile.type === '-' && templateId) {
        await this.copyFileToS3(
          sftpClient,
          `${baseSftpPath}/${supplierReference}/${proofFile.name}`,
          `${baseS3Path}/${templateId}/${proofFile.name}`,
          idLogger
        );
      } else {
        idLogger.info('Unexpected item found', { proofFile });
      }
    }
  }

  private async copyFileToS3(
    sftpClient: SftpClient,
    sftpPath: string,
    s3Path: string,
    logger: Logger
  ) {
    const pathLogger = logger.child({ s3Path, sftpPath });

    pathLogger.info('Copying file');
    try {
      const data = (await sftpClient.get(sftpPath)) as Buffer;

      const fileValidation = await this.validateFile(data);

      if (fileValidation) {
        await this.s3Repository.putRawData(data, s3Path, {
          ChecksumAlgorithm: 'SHA256',
        });
      } else {
        pathLogger.error('PDF file failed validation');
      }

      await sftpClient.delete(sftpPath);
    } catch (error) {
      pathLogger.error('Failed to process file', error);
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
