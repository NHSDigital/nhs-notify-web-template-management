import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { TemplateStatus } from 'nhs-notify-backend-client';
import type { TemplateRenderIds } from 'nhs-notify-backend-client/src/types/render-request';

export class TemplateRepository {
  constructor(private readonly ddb: DynamoDBDocumentClient) {}

  async update(
    _template: TemplateRenderIds,
    _renderVariant: 'initial' | 'long' | 'short',
    _renderStatus: 'RENDERED' | 'FAILED',
    _templateStatus?: Extract<
      TemplateStatus,
      'NOT_YET_SUBMITTED' | 'VALIDATION_FAILED'
    >,
    _pageCount?: number,
    _filename?: string
  ): Promise<void> {}
}
