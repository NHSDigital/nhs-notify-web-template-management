import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { TemplateUpdateBuilder } from 'nhs-notify-entity-update-command-builder';

export class TemplateRepository {
  constructor(
    private readonly client: DynamoDBDocumentClient,
    private readonly templatesTableName: string
  ) {}

  async updateToNotYetSubmitted(owner: string, id: string) {
    const update = new TemplateUpdateBuilder(this.templatesTableName, owner, id)
      .setStatus('NOT_YET_SUBMITTED')
      .build();

    return await this.client.send(new UpdateCommand(update));
  }
}
