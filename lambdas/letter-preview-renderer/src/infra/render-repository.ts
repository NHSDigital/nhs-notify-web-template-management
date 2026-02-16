import { randomUUID } from 'node:crypto';
import { S3Repository } from 'nhs-notify-web-template-management-utils';
import type { TemplateRenderIds } from 'nhs-notify-backend-client/src/types/render-request';

export class RenderRepository {
  constructor(private readonly s3: S3Repository) {}

  async save(
    pdf: Buffer,
    template: TemplateRenderIds,
    _pageCount: number
  ): Promise<string> {
    const id = randomUUID();
    const key = `${template.clientId}/${template.templateId}/renders/${id}.pdf`;

    await this.s3.putRawData(pdf, key);

    return key;
  }
}
