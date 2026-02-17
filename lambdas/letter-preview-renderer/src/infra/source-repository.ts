/* eslint-disable security/detect-non-literal-fs-filename */
import { randomUUID } from 'node:crypto';
import type { S3Repository } from 'nhs-notify-web-template-management-utils';
import { createWriteStream, unlinkSync, mkdirSync, existsSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import type { TemplateRenderIds } from 'nhs-notify-backend-client/src/types/render-request';
import { RenderFailureError } from '../types/errors';

export type SourceHandle = {
  path: string;
  cleanup: () => void;
};

// eslint-disable-next-line sonarjs/publicly-writable-directories
const sourceTmpDir = '/tmp/source';

export class SourceRepository {
  constructor(
    private readonly s3: S3Repository,
    private readonly logger: Logger
  ) {}

  async getSource({
    templateId,
    clientId,
  }: TemplateRenderIds): Promise<SourceHandle> {
    const path = this.tempPath();

    try {
      mkdirSync(sourceTmpDir, { recursive: true });

      console.log(existsSync(sourceTmpDir));

      const stream = await this.s3.getObjectStream(
        this.sourcePathS3(templateId, clientId)
      );

      await pipeline(stream, createWriteStream(path));

      return this.createHandle(path);
    } catch (error) {
      throw new RenderFailureError('source-fetch', error);
    }
  }

  private createHandle(path: string): SourceHandle {
    return {
      path,
      cleanup: () => {
        try {
          unlinkSync(path);
        } catch (error) {
          this.logger
            .child({ path })
            .warn('Failed to delete temporary source file', error);
        }
      },
    };
  }

  private tempPath() {
    const uuid = randomUUID();
    return `${sourceTmpDir}/${uuid}.docx`;
  }

  private sourcePathS3(templateId: string, clientId: string) {
    return `${clientId}/letter-source/${templateId}/${templateId}.docx`;
  }
}
