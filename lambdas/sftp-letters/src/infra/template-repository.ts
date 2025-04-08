import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { TemplateUpdateBuilder } from 'nhs-notify-entity-update-command-builder';

export class TemplateRepository {
  constructor(
    private readonly client: DynamoDBDocumentClient,
    private readonly templatesTableName: string
  ) {}

  async updateToSendingProof(owner: string, id: string) {
    const update = new TemplateUpdateBuilder(this.templatesTableName, owner, id)
      .setStatus('SENDING_PROOF')
      .expectedStatus('PASSED_VALIDATION')
      .build();

    return await this.client.send(new UpdateCommand(update));
  }

  async updateToAwaitingProof(owner: string, id: string) {
    const update = new TemplateUpdateBuilder(this.templatesTableName, owner, id)
      .setStatus('AWAITING_PROOF')
      .expectedStatus('SENDING_PROOF')
      .build();

    return await this.client.send(new UpdateCommand(update));
  }
}
