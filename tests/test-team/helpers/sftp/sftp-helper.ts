import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import SftpClient from 'ssh2-sftp-client';
import { z } from 'zod';

export class SftpHelper {
  private readonly client = new SftpClient();

  private readonly ssm = new SSMClient({ region: 'eu-west-2' });

  async connect() {
    const sftpCredentialSsmResult = await this.ssm.send(
      new GetParameterCommand({
        Name: process.env.SFTP_MOCK_CREDENTIAL_PATH,
        WithDecryption: true,
      })
    );

    const sftpMockCredentials = z
      .object({
        host: z.string(),
        username: z.string(),
        privateKey: z.string(),
        baseUploadDir: z.string(),
      })
      .parse(JSON.parse(sftpCredentialSsmResult.Parameter?.Value ?? ''));

    await this.client.connect({
      host: sftpMockCredentials.host,
      username: sftpMockCredentials.username,
      privateKey: sftpMockCredentials.privateKey,
    });

    return sftpMockCredentials;
  }

  public get = this.client.get.bind(this.client);
  public mkdir = this.client.mkdir.bind(this.client);
  public end = this.client.end.bind(this.client);
}
