import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import { Template } from '../types';

type TemplateKey = { owner: string; id: string };

export class TemplateStorageHelper {
  private readonly ddbDocClient: DynamoDBDocumentClient;

  constructor() {
    const dynamoClient = new DynamoDBClient({ region: 'eu-west-2' });
    this.ddbDocClient = DynamoDBDocumentClient.from(dynamoClient);
  }

  private seedData: Template[] = [];

  private adHocTemplateKeys: TemplateKey[] = [];

  /**
   * Seed a load of templates into the database
   */
  async seedTemplateData(data: Template[]) {
    this.seedData.push(...data);

    const chunks = TemplateStorageHelper.chunk(data);

    await Promise.all(
      chunks.map(async (chunk) => {
        await this.ddbDocClient.send(
          new BatchWriteCommand({
            RequestItems: {
              [process.env.TEMPLATES_TABLE_NAME]: chunk.map((template) => ({
                PutRequest: {
                  Item: template,
                },
              })),
            },
          })
        );
      })
    );
  }

  /**
   * Delete templates seeded by calls to seedTemplateData
   */
  public async deleteSeededTemplates() {
    await this.deleteTemplates(this.seedData);
    this.seedData = [];
  }

  /**
   * Stores references to templates created in tests (not via seeding)
   */
  public addAdHocTemplateKey(key: TemplateKey) {
    this.adHocTemplateKeys.push(key);
  }

  /**
   * Delete templates from database referenced by calls to addAdHocTemplateKey
   */
  async deleteAdHocTemplates() {
    await this.deleteTemplates(this.adHocTemplateKeys);
    this.adHocTemplateKeys = [];
  }

  private async deleteTemplates(keys: TemplateKey[]) {
    const chunks = TemplateStorageHelper.chunk(keys);

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
  }

  /**
   * Breaks a list into chunks of upto 25 items
   */
  private static chunk<T>(list: T[]): T[][] {
    const chunks: T[][] = [];

    for (let i = 0; i < list.length; i += 25) {
      chunks.push(list.slice(i, i + 25));
    }

    return chunks;
  }
}
