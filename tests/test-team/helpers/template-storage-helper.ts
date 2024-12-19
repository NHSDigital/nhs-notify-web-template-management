import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { Template } from './types';
import { sleep } from './sleep';

export class TemplateStorageHelper {
  private readonly ddbDocClient: DynamoDBDocumentClient;

  constructor(private readonly templateData: Template[]) {
    const dynamoClient = new DynamoDBClient({ region: 'eu-west-2' });
    this.ddbDocClient = DynamoDBDocumentClient.from(dynamoClient);
  }

  async seedTemplateData() {
    const promises = this.templateData.map((template) =>
      this.ddbDocClient.send(
        new PutCommand({
          TableName: process.env.TEMPLATE_STORAGE_TABLE_NAME,
          Item: template,
        })
      )
    );

    await Promise.all(promises);

    // Note: sleeping to allow DynamoDB some time to settle...
    await sleep(2);
  }

  async deleteTemplateData() {
    const promises = this.templateData.map((template) =>
      this.ddbDocClient.send(
        new DeleteCommand({
          TableName: process.env.TEMPLATE_STORAGE_TABLE_NAME,
          Key: {
            id: template.id,
            owner: template.owner,
          },
        })
      )
    );

    await Promise.all(promises);
  }
}
