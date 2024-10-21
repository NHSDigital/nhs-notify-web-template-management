import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { DatabaseTableNameHelper } from './database-tablename-helper';
import { Template } from './types';

export class TemplateStorageHelper {
  private readonly _templates: Template[];

  private readonly _ddbDocClient: DynamoDBDocumentClient;

  constructor(templates: Template[]) {
    this._templates = templates;
    const dynamoClient = new DynamoDBClient({ region: 'eu-west-2' });
    this._ddbDocClient = DynamoDBDocumentClient.from(dynamoClient);
  }

  async seedTemplateData() {
    const tableName =
      await DatabaseTableNameHelper.instance.getTemplateStorageTableName();

    const promises = this._templates.map((template) =>
      this._ddbDocClient.send(
        new PutCommand({
          TableName: tableName,
          Item: {
            ...template,
          },
        })
      )
    );
    await Promise.all(promises);
  }

  async deleteTemplateData() {
    const tableName =
      await DatabaseTableNameHelper.instance.getTemplateStorageTableName();

    await this.deleteTemplates(this._templates.map((template) => template.id));
  }

  async getTemplate(templateId: string) {
    const tableName =
      await DatabaseTableNameHelper.instance.getTemplateStorageTableName();

    const template = await this._ddbDocClient.send(
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
      this._ddbDocClient.send(
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
