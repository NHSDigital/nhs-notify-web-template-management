import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import type { RoutingConfig } from 'nhs-notify-backend-client';

type RoutingConfigKey = Pick<RoutingConfig, 'id' | 'owner'>;

export class RoutingConfigStorageHelper {
  private readonly dynamo: DynamoDBDocumentClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: 'eu-west-2' })
  );

  private seedData: RoutingConfig[] = [];

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
      this.seedData.map(({ id, owner }) => ({
        id,
        owner,
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
  private static chunk<T>(list: T[], size = 25): T[][] {
    const chunks: T[][] = [];

    for (let i = 0; i < list.length; i += size) {
      chunks.push(list.slice(i, i + size));
    }

    return chunks;
  }
}
