import { randomUUID } from 'node:crypto';
import type { S3Repository } from 'nhs-notify-web-template-management-utils';
import type { RenderRequest } from 'nhs-notify-backend-client/src/types/render-request';

export class RenderRepository {
  constructor(private readonly s3: S3Repository) {}

  async save(
    pdf: Buffer,
    request: RenderRequest,
    pageCount: number
  ): Promise<string> {
    const id = randomUUID();
    const metadata = this.buildMetadata(request, pageCount);
    const key = this.s3Key(request, id);

    const response = await this.s3.putRawData(pdf, key, {
      Metadata: metadata,
    });

    if (!response.VersionId) {
      throw new Error('S3 did not return a VersionId');
    }

    return `${id}.pdf`;
  }

  private buildMetadata(
    { templateId, clientId, requestType }: RenderRequest,
    pageCount: number
  ) {
    return {
      'page-count': pageCount.toString(),
      'template-id': templateId,
      'client-id': clientId,
      variant: requestType,
    };
  }

  private s3Key(
    { templateId, clientId, requestType }: RenderRequest,
    id: string
  ) {
    return `${clientId}/${templateId}/renders/${requestType}/${id}.pdf`;
  }
}
