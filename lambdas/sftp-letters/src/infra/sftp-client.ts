import type { Readable } from 'node:stream';
import Client, { type ConnectOptions } from 'ssh2-sftp-client';
import crypto from 'node:crypto';

type FileInfoType = 'd' | '-' | 'l';

export type FileInfo = {
  name: string;
  type: FileInfoType;
  modifyTime: number;
};

export class SftpClient {
  private readonly _client: Client;

  private readonly _config: ConnectOptions;

  constructor(
    host: string,
    username: string,
    privateKey: string,
    hostKey: string
  ) {
    this._client = new Client();
    this._config = {
      host,
      username,
      privateKey,
      hostVerifier: (key: Buffer): boolean =>
        hostKey ===
        `SHA256:${crypto.createHash('sha256').update(key).digest('base64')}`,
    };
  }

  public async connect(): Promise<void> {
    await this._client.connect(this._config);
  }

  public async end(): Promise<void> {
    await this._client.end();
  }

  public async put(objectStream: Readable, location: string): Promise<void> {
    await this._client.put(objectStream, location);
  }

  public async mkdir(path: string, recursive?: boolean): Promise<void> {
    await this._client.mkdir(path, recursive);
  }

  public async list(location: string): Promise<FileInfo[]> {
    const files = await this._client.list(location);
    return files.map(({ name, type, modifyTime }) => ({
      name,
      type,
      modifyTime,
    }));
  }

  public async exists(location: string): Promise<false | FileInfoType> {
    return this._client.exists(location);
  }

  public async get(
    location: string,
    destination?: string | NodeJS.WritableStream
  ): Promise<string | Buffer | NodeJS.WritableStream> {
    return await this._client.get(location, destination);
  }

  public async delete(location: string): Promise<void> {
    await this._client.delete(location);
  }

  public async rename(source: string, destination: string): Promise<void> {
    await this._client.rename(source, destination);
  }
}
