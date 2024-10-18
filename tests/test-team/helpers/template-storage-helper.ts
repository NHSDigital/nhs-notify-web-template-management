import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';
import { DatabaseTableNameHelper } from './database-tablename-helper';
import { Template } from './types';

export class TemplateStorageHelper {
  private readonly ddbDocClient: DynamoDBDocumentClient;

  constructor() {
    const dynamoClient = new DynamoDBClient({ region: 'eu-west-2' });
    this.ddbDocClient = DynamoDBDocumentClient.from(dynamoClient);
  }

  async getTemplate(templateId: string) {
    const tableName =
      await DatabaseTableNameHelper.instance.getTemplateStorageTableName();

    const template = await this.ddbDocClient.send(
      new GetCommand({
        TableName: tableName,
        Key: {
          id: templateId,
        },
      })
    );

    return template.Item as Template;
  }

  async deleteTemplates(templateIds: string[]) {
    const tableName =
      await DatabaseTableNameHelper.instance.getTemplateStorageTableName();

    const promises = templateIds.map((templateId) =>
      this.ddbDocClient.send(
        new DeleteCommand({
          TableName: tableName,
          Key: {
            id: templateId,
          },
        })
      )
    );

    await Promise.all(promises);
  }
}
