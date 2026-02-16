import { randomUUID } from 'node:crypto';
import { S3Repository } from 'nhs-notify-web-template-management-utils';
import type { TemplateRenderIds } from 'nhs-notify-backend-client/src/types/render-request';
import { RenderVariant } from '../types/types';
import { failure, Result, success } from '../types/result';

export class RenderRepository {
  constructor(private readonly s3: S3Repository) {}

  async save(
    pdf: Buffer,
    template: TemplateRenderIds,
    renderVariant: RenderVariant,
    pageCount: number
  ): Promise<Result<string>> {
    const metadata = this.buildMetadata(template, renderVariant, pageCount);
    const key = this.s3Key(template, renderVariant);

    try {
      await this.s3.putRawData(pdf, key, {
        Metadata: metadata,
      });

      return success(key);
    } catch (error) {
      return failure(error);
    }
  }

  private buildMetadata(
    { templateId, clientId }: TemplateRenderIds,
    renderVariant: RenderVariant,
    pageCount: number
  ) {
    return {
      'page-count': pageCount.toString(),
      'template-id': templateId,
      'client-id': clientId,
      variant: renderVariant,
    };
  }

  private s3Key(
    { templateId, clientId }: TemplateRenderIds,
    renderVariant: RenderVariant
  ) {
    const id = randomUUID();

    return `${clientId}/${templateId}/renders/${renderVariant}/${id}.pdf`;
  }
}
