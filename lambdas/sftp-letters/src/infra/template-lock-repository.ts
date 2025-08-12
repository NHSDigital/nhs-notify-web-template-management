import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { TemplateUpdateBuilder } from 'nhs-notify-entity-update-command-builder';

const THIRTY_DAYS_MS = 2_592_000_000;

export class TemplateLockRepository {
  private readonly clientOwnerPrefix = 'CLIENT#';

  constructor(
    private readonly client: DynamoDBDocumentClient,
    private readonly templatesTableName: string,
    private readonly getDate: () => Date,
    private readonly lockTtl: number
  ) {}

  async acquireLock(
    owner: string,
    id: string,
    clientOwned: boolean
  ): Promise<boolean> {
    const time = this.getDate().getTime();

    const update = new TemplateUpdateBuilder(
      this.templatesTableName,
      clientOwned ? this.addClientOwnerPrefix(owner) : owner,
      id
    )
      .setLockTime('sftpSendLockTime', time, time + this.lockTtl)
      .build();

    try {
      await this.client.send(new UpdateCommand(update));
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        return false;
      } else {
        throw error;
      }
    }
    return true;
  }

  async finaliseLock(owner: string, id: string, clientOwned: boolean) {
    const time = this.getDate().getTime();

    const update = new TemplateUpdateBuilder(
      this.templatesTableName,
      clientOwned ? this.addClientOwnerPrefix(owner) : owner,
      id
    )
      .setLockTimeUnconditional('sftpSendLockTime', time + THIRTY_DAYS_MS)
      .build();

    return await this.client.send(new UpdateCommand(update));
  }

  private addClientOwnerPrefix(owner: string) {
    return `CLIENT#${owner}`;
  }
}
