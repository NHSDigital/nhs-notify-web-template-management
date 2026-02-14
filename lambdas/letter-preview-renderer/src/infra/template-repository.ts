import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { TemplateStatus } from 'nhs-notify-backend-client';

export class TemplateRepository {
  constructor(private readonly ddb: DynamoDBDocumentClient) {}

  async recordInitialRender(
    _templateId: string,
    _clientId: string,
    _pageCount: number,
    _filename: string,
    _status: Extract<TemplateStatus, 'NOT_YET_SUBMITTED' | 'VALIDATION_FAILED'>
  ) {}
}
