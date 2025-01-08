import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { Template } from './types';

function sleep(secs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, secs * 1000);
  });
}

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

    // temporarily add this to see if this helps with the automated tests
    await sleep(5);
  }

  async deleteTemplateData() {
    const promises = this.templateData.map((template) =>
      this.ddbDocClient.send(
        new DeleteCommand({
          TableName: process.env.TEMPLATE_STORAGE_TABLE_NAME,
          Key: {
            id: template.id,
            owner: process.env.USER_ID,
          },
        })
      )
    );

    await Promise.all(promises);
  }
}
