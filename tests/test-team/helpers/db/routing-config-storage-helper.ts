import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import type { RoutingConfig } from 'nhs-notify-backend-client';

type RoutingConfigKey = { id: string; clientId: string };

export class RoutingConfigStorageHelper {
  private readonly dynamo: DynamoDBDocumentClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: 'eu-west-2' })
  );

  private seedData: RoutingConfig[] = [];

  private adHocKeys: RoutingConfigKey[] = [];

  /**
   * Get all routing configs from the database
   */
  async getAllRoutingConfigs(): Promise<RoutingConfig[]> {
    const allItems: RoutingConfig[] = [];
    let lastEvaluatedKey: Record<string, unknown> | undefined;

    do {
      const { Items, LastEvaluatedKey } = await this.dynamo.send(
        new ScanCommand({
          TableName: process.env.ROUTING_CONFIG_TABLE_NAME,
          ExclusiveStartKey: lastEvaluatedKey,
        })
      );

      if (Items) {
        allItems.push(...(Items as RoutingConfig[]));
      }

      lastEvaluatedKey = LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return allItems;
  }

  /**
   * Delete routing configs from the database with optional filters
   * @param filters Optional filters to apply:
   *   - clientId: Only delete routing configs for a specific client
   *   - createdAfter: Only delete routing configs created on or after this date (ISO string or Date)
   *   - status: Only delete routing configs with a specific status
   * @returns Number of routing configs deleted
   */
  async deleteRoutingConfigs(filters?: {
    clientId?: string;
    createdAfter?: string | Date;
    status?: string;
  }): Promise<number> {
    let configsToDelete = await this.getAllRoutingConfigs();

    if (filters) {
      if (filters.clientId) {
        configsToDelete = configsToDelete.filter(
          (config) => config.clientId === filters.clientId
        );
      }

      if (filters.createdAfter) {
        const targetDate =
          typeof filters.createdAfter === 'string'
            ? new Date(filters.createdAfter)
            : filters.createdAfter;
        configsToDelete = configsToDelete.filter((config) => {
          const createdAt = new Date(config.createdAt);
          return createdAt >= targetDate;
        });
      }

      if (filters.status) {
        configsToDelete = configsToDelete.filter(
          (config) => config.status === filters.status
        );
      }
    }

    if (configsToDelete.length === 0) {
      return 0;
    }

    await this.delete(
      configsToDelete.map(({ id, clientId }) => ({
        id,
        clientId,
      }))
    );

    return configsToDelete.length;
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
