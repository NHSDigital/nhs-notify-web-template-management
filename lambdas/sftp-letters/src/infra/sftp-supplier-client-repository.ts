import { z } from 'zod';
import { SftpClient } from './sftp-client';
import type { SftpSupplierConfig } from './types';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import NodeCache from 'node-cache';

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
  name: string;
};

export class SftpSupplierClientRepository {
  constructor(
    private readonly csi: string,
    private readonly ssmClient: SSMClient,
    private readonly cache: NodeCache,
    private readonly logger: Logger
  ) {}

  async getClient(supplier: string) {
    this.logger.info({
      description: 'Retrieving SFTP details for supplier from SSM',
      supplier,
    });

    const sftpCredKey = `/${this.csi}/sftp-config/${supplier}`;

    let credentialStr = this.cache.get<string>(sftpCredKey);

    if (!credentialStr) {
      const ssmResult = await this.ssmClient.send(
        new GetParameterCommand({ Name: sftpCredKey, WithDecryption: true })
      );
      credentialStr = ssmResult.Parameter?.Value;

      if (credentialStr) {
        this.cache.set(sftpCredKey, credentialStr);
      }
    }

    if (!credentialStr) {
      throw new Error('SFTP credentials are undefined');
    }

    const {
      host,
      username,
      privateKey,
      hostKey,
      baseUploadDir,
      baseDownloadDir,
    } = getConfigFromSsmString(credentialStr);

    return {
      sftpClient: new SftpClient(host, username, privateKey, hostKey),
      baseUploadDir,
      baseDownloadDir,
      name: supplier,
    };
  }

  async listClients(): Promise<SupplierSftpClient[]> {
    this.logger.info({
      description: 'Retrieving SFTP details for suppliers from SSM',
    });

    const sftpCredParameterPath = `/${this.csi}/sftp-config`;

    const ssmResult = await this.ssmClient.send(
      new GetParametersByPathCommand({
        Path: sftpCredParameterPath,
        WithDecryption: true,
      })
    );

    const sftpClientParameters = ssmResult.Parameters ?? [];

    return sftpClientParameters.map(
      ({ Name: name, Value: sftpCredentials }) => {
        if (!name || !sftpCredentials) {
          throw new Error(`SFTP credentials for ${name} are undefined`);
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
          name,
        };
      }
    );
  }
}
