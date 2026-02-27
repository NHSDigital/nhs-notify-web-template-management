import { randomUUID } from 'node:crypto';
import type { S3Repository } from 'nhs-notify-web-template-management-utils';
import type { RenderRequest } from 'nhs-notify-backend-client/src/types/render-request';

export type SaveResult = {
  fileName: string;
  currentVersion: string;
};

export class RenderRepository {
  constructor(private readonly s3: S3Repository) {}

  async save(
    pdf: Buffer,
    request: RenderRequest,
    pageCount: number
  ): Promise<SaveResult> {
    const id = randomUUID();
    const metadata = this.buildMetadata(request, pageCount);
    const key = this.s3Key(request, id);

    await this.s3.putRawData(pdf, key, {
      Metadata: metadata,
      ContentType: 'application/pdf',
      ContentDisposition: 'inline',
    });

    return { fileName: `${id}.pdf`, currentVersion: id };
  }

  private buildMetadata(
    { templateId, clientId, requestType }: RenderRequest,
    pageCount: number
  ) {
    return {
      'page-count': pageCount.toString(),
      'template-id': templateId,
      'client-id': clientId,
      'request-type': requestType,
      'file-type': 'render',
    };
  }

  private s3Key({ templateId, clientId }: RenderRequest, id: string) {
    return `${clientId}/renders/${templateId}/${id}.pdf`;
  }
}
