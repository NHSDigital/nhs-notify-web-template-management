import { z } from 'zod';
import { SftpClient } from './sftp-client';
import type { SftpSupplierConfig } from './types';
import type { Logger } from 'nhs-notify-web-template-management-utils';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

export const getConfigFromSsmString = (ssmString: string): SftpSupplierConfig =>
  z
    .object({
      host: z.string(),
      username: z.string(),
      privateKey: z.string(),
      hostKey: z.string(),
      baseUploadDir: z.string(),
      baseDownloadDir: z.string(),
    })
    .parse(JSON.parse(ssmString));

export type SupplierSftpClient = {
  sftpClient: SftpClient;
  baseUploadDir: string;
  baseDownloadDir: string;
};

export class SftpSupplierClientRepository {
  constructor(
    private csi: string,
    private ssmClient: SSMClient
  ) {}

  async getClient(supplier: string, logger: Logger) {
    logger.info({
      description: 'Retrieving SFTP details for supplier from SSM',
    });

    const sftpCredParameter = `/${this.csi}/sftp-config/${supplier}`;

    const ssmResult = await this.ssmClient.send(
      new GetParameterCommand({ Name: sftpCredParameter, WithDecryption: true })
    );

    const sftpCredentials = ssmResult.Parameter?.Value;

    if (!sftpCredentials) {
      throw new Error('SFTP credentials are undefined');
    }

    const {
      host,
      username,
      privateKey,
      hostKey,
      baseUploadDir,
      baseDownloadDir,
    } = getConfigFromSsmString(sftpCredentials);

    return {
      sftpClient: new SftpClient(host, username, privateKey, hostKey),
      baseUploadDir,
      baseDownloadDir,
    };
  }
}
