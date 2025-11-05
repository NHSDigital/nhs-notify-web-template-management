import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';
import type { RoutingConfigDbEntry } from 'helpers/types';
import type { RoutingConfig } from 'nhs-notify-backend-client';

type RoutingConfigKey = { id: string; clientId: string };

export class RoutingConfigStorageHelper {
  private readonly dynamo: DynamoDBDocumentClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: 'eu-west-2' })
  );

  private seedData: RoutingConfig[] = [];

  private adHocKeys: RoutingConfigKey[] = [];

  async get(key: RoutingConfigKey): Promise<RoutingConfigDbEntry | null> {
    const { Item } = await this.dynamo.send(
      new GetCommand({
        TableName: process.env.ROUTING_CONFIG_TABLE_NAME,
        Key: {
          id: key.id,
          owner: this.clientOwnerKey(key.clientId),
        },
      })
    );

    return Item as RoutingConfigDbEntry;
  }

  /**
   * Seed a load of routing configs into the database
   */
  async seed(data: RoutingConfig[]) {
    this.seedData.push(...data);

    const chunks = RoutingConfigStorageHelper.chunk(data);

    await Promise.all(
      chunks.map(async (chunk) => {
        await this.dynamo.send(
          new BatchWriteCommand({
            RequestItems: {
              [process.env.ROUTING_CONFIG_TABLE_NAME]: chunk.map(
                (routingConfig) => ({
                  PutRequest: {
                    Item: routingConfig,
                  },
                })
              ),
            },
          })
        );
      })
    );
  }

  /**
   * Delete routing configs seeded by calls to seed
   */
  public async deleteSeeded() {
    await this.delete(
      this.seedData.map(({ id, clientId }) => ({
        id,
        clientId,
      }))
    );
    this.seedData = [];
  }

  private async delete(keys: RoutingConfigKey[]) {
    const dbChunks = RoutingConfigStorageHelper.chunk(keys);

    await Promise.all(
      dbChunks.map((chunk) =>
        this.dynamo.send(
          new BatchWriteCommand({
            RequestItems: {
              [process.env.ROUTING_CONFIG_TABLE_NAME]: chunk.map(
                ({ id, clientId }) => ({
                  DeleteRequest: {
                    Key: {
                      id,
                      owner: this.clientOwnerKey(clientId),
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
   * Stores references to routing configs created in tests (not via seeding)
   */
  public addAdHocKey(key: RoutingConfigKey) {
    this.adHocKeys.push(key);
  }

  /**
   * Delete routing configs referenced by calls to addAdHocKey from database
   */
  async deleteAdHoc() {
    await this.delete(this.adHocKeys);
    this.adHocKeys = [];
  }

  /**
   * Breaks a list into chunks of upto 25 items
   */
  private static chunk<T>(list: T[], size = 25): T[][] {
    const chunks: T[][] = [];

    for (let i = 0; i < list.length; i += size) {
      chunks.push(list.slice(i, i + size));
    }

    return chunks;
  }

  private clientOwnerKey(clientId: string) {
    return `CLIENT#${clientId}`;
  }
}
