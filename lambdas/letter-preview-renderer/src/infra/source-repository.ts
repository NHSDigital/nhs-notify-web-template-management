/* eslint-disable security/detect-non-literal-fs-filename */
import { randomUUID } from 'node:crypto';
import type { S3Repository } from 'nhs-notify-web-template-management-utils';
import { createWriteStream, unlinkSync, mkdirSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import type { TemplateRenderIds } from 'nhs-notify-backend-client/src/types/render-request';

// eslint-disable-next-line sonarjs/publicly-writable-directories
const sourceTmpDir = '/tmp/source';

export type SourceHandle = {
  path: string;
  dispose: () => void;
};

export class SourceRepository {
  constructor(
    private readonly s3: S3Repository,
    private readonly logger: Logger
  ) {
    mkdirSync(sourceTmpDir, { recursive: true });
  }

  async getSource({
    templateId,
    clientId,
  }: TemplateRenderIds): Promise<SourceHandle> {
    const path = this.tempPath();

    try {
      const stream = await this.s3.getObjectStream(
        this.sourcePathS3(templateId, clientId)
      );

      await pipeline(stream, createWriteStream(path));

      return { path, dispose: () => this.dispose(path) };
    } catch (error) {
      throw error;
    }
  }

  private dispose(path: string) {
    try {
      unlinkSync(path);
    } catch (error) {
      this.logger
        .child({ path })
        .warn('Failed to delete temporary source file', error);
    }
  }

  private tempPath() {
    const uuid = randomUUID();
    return `${sourceTmpDir}/${uuid}.docx`;
  }

  private sourcePathS3(templateId: string, clientId: string) {
    return `docx-template/${clientId}/${templateId}/${templateId}.docx`;
  }
}
