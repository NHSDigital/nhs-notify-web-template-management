/* eslint-disable security/detect-non-literal-fs-filename */
import { randomUUID } from 'node:crypto';
import type { S3Repository } from 'nhs-notify-web-template-management-utils';
import { createWriteStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import type { TemplateRenderIds } from 'nhs-notify-backend-client/src/types/render-request';

export class SourceRepository {
  constructor(
    private readonly s3: S3Repository,
    private readonly logger: Logger
  ) {}

  async getSource({ templateId, clientId }: TemplateRenderIds) {
    const stream = await this.s3.getObjectStream(
      this.sourcePathS3(templateId, clientId)
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
      await unlink(path).catch((error) =>
        this.logger
          .child({ path })
          .error('Failed to delete temporary source file', error)
      );
    };
  }

  private tempPath() {
    const uuid = randomUUID();
    return `/tmp/source/${uuid}.docx`;
  }

  private sourcePathS3(templateId: string, clientId: string) {
    return `${clientId}/letter-source/${templateId}/${templateId}.docx`;
  }
}
