/* eslint-disable security/detect-non-literal-fs-filename */
import { randomUUID } from 'node:crypto';
import { S3Repository } from 'nhs-notify-web-template-management-utils';
import { createWriteStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

export class SourceRepository {
  constructor(private readonly s3: S3Repository) {}

  async getSource(templateId: string, clientId: string) {
    const stream = await this.s3.getObjectStream(
      this.sourcePath(templateId, clientId)
    );

    const path = await this.streamToTemp(stream);

    return {
      path,
      [Symbol.asyncDispose]: this.dispose(path),
    };
  }

  private async streamToTemp(stream: Readable) {
    const path = this.tempPath();

    await pipeline(stream, createWriteStream(path));
    return path;
  }

  private dispose(path: string) {
    return async () => {
      unlink(path);
    };
    // catch, log
  }

  private tempPath() {
    const uuid = randomUUID();
    return `/tmp/${uuid}.docx`;
  }

  private sourcePath(templateId: string, clientId: string) {
    return `${clientId}/letter-source/${templateId}/${templateId}.docx`;
  }
}
