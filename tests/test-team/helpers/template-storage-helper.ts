import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
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
    const promises = this._templates.map((template) =>
      this._ddbDocClient.send(
        new PutCommand({
          TableName: process.env.TEMPLATE_STORAGE_TABLE_NAME,
          Item: {
            ...template,
          },
        })
      )
    );
    await Promise.all(promises);
  }

  async deleteTemplateData() {
    await this.deleteTemplates(this._templates.map((template) => template.id));
  }

  async getTemplate(templateId: string) {
    const template = await this._ddbDocClient.send(
      new GetCommand({
        TableName: process.env.TEMPLATE_STORAGE_TABLE_NAME,
        Key: {
          id: templateId,
        },
      })
    );

    return template.Item as Template;
  }

  async deleteTemplates(templateIds: string[]) {
    const promises = templateIds.map((templateId) =>
      this._ddbDocClient.send(
        new DeleteCommand({
          TableName: process.env.TEMPLATE_STORAGE_TABLE_NAME,
          Key: {
            id: templateId,
          },
        })
      )
    );

    await Promise.all(promises);
  }
}
