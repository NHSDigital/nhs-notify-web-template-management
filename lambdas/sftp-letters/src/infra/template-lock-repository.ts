import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { TemplateUpdateBuilder } from 'nhs-notify-entity-update-command-builder';

const THIRTY_DAYS_MS = 2_592_000_000;

export class TemplateLockRepository {
  constructor(
    private readonly client: DynamoDBDocumentClient,
    private readonly templatesTableName: string,
    private readonly getDate: () => Date,
    private readonly lockTtl: number
  ) {}

  // TODO: CCM-12327
  async acquireLockAndSetSupplierReference(
    clientId: string,
    id: string,
    supplier: string,
    supplierReference: string
  ): Promise<boolean> {
    const time = this.getDate().getTime();

    const update = new TemplateUpdateBuilder(
      this.templatesTableName,
      clientId,
      id
    )
      .setLockTime('sftpSendLockTime', time, time + this.lockTtl)
      .setSupplierReference(supplier, supplierReference)
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

  // TODO: CCM-12327
  async finaliseLock(clientId: string, id: string) {
    const time = this.getDate().getTime();

    const update = new TemplateUpdateBuilder(
      this.templatesTableName,
      clientId,
      id
    )
      .setLockTimeUnconditional('sftpSendLockTime', time + THIRTY_DAYS_MS)
      .build();

    return await this.client.send(new UpdateCommand(update));
  }
}
