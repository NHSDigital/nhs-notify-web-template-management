import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  BatchWriteCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { Template } from '../types';

type TemplateKey = { owner: string; id: string };

export class TemplateStorageHelper {
  private readonly ddbDocClient: DynamoDBDocumentClient;

  constructor(private readonly templateData: Template[] = []) {
    const dynamoClient = new DynamoDBClient({ region: 'eu-west-2' });
    this.ddbDocClient = DynamoDBDocumentClient.from(dynamoClient);
  }

  private templateKeys: TemplateKey[] = [];

  /**
   * Seed templates to Amplify managed database table
   */

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
  }

  /**
   * Delete templates from Amplify managed database table
   */
  async deleteTemplateData(extraTemplateIds: string[] = []) {
    const templateIds = [
      ...extraTemplateIds,
      ...this.templateData.map(({ id }) => id),
    ];
    const promises = templateIds.map((id) =>
      this.ddbDocClient.send(
        new DeleteCommand({
          TableName: process.env.TEMPLATE_STORAGE_TABLE_NAME,
          Key: {
            id,
          },
        })
      )
    );

    await Promise.all(promises);
  }

  public addTemplateKey(key: TemplateKey) {
    this.templateKeys.push(key);
  }

  /**
   * Delete templates from Terraform managed database table.
   * Deleting directly from DB as API only supports soft-delete
   */
  async deleteTemplates() {
    const chunks: { id: string; owner: string }[][] = [];

    for (let i = 0; i < this.templateKeys.length; i += 25) {
      chunks.push(this.templateKeys.slice(i, i + 25));
    }

    await Promise.all(
      chunks.map((chunk) =>
        this.ddbDocClient.send(
          new BatchWriteCommand({
            RequestItems: {
              [process.env.TEMPLATES_TABLE_NAME]: chunk.map(
                ({ id, owner }) => ({
                  DeleteRequest: {
                    Key: {
                      id,
                      owner,
                    },
                  },
                })
              ),
            },
          })
        )
      )
    );

    this.templateKeys = [];
  }
}
