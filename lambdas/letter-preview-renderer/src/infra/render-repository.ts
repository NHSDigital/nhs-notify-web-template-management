import { S3Repository } from 'nhs-notify-web-template-management-utils';

export class RenderRepository {
  constructor(private readonly s3: S3Repository) {}

  async save(_pdf: Buffer, _templateId: string, _clientId: string) {}
}
