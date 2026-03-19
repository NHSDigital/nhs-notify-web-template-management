import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import type { DigitalProofRequest } from '../types';

type ProofRequestKey = { id: string; owner: string };

export class ProofRequestsStorageHelper {
  private readonly dynamo: DynamoDBDocumentClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: 'eu-west-2' })
  );

  private seedData: DigitalProofRequest[] = [];

  private adHocKeys: ProofRequestKey[] = [];

  /**
   * Seed a load of proof requests into the database
   */
  async seed(data: DigitalProofRequest[]) {
    this.seedData.push(...data);

    const chunks = ProofRequestsStorageHelper.chunk(data);

    await Promise.all(
      chunks.map(async (chunk) => {
        await this.dynamo.send(
          new BatchWriteCommand({
            RequestItems: {
              [process.env.PROOF_REQUESTS_TABLE_NAME]: chunk.map(
                (proofRequest) => ({
                  PutRequest: {
                    Item: proofRequest,
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
   * Delete proof requests seeded by calls to seed
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

  private async delete(keys: ProofRequestKey[]) {
    const dbChunks = ProofRequestsStorageHelper.chunk(keys);

    await Promise.all(
      dbChunks.map((chunk) =>
        this.dynamo.send(
          new BatchWriteCommand({
            RequestItems: {
              [process.env.PROOF_REQUESTS_TABLE_NAME]: chunk.map((key) => ({
                DeleteRequest: {
                  Key: key,
                },
              })),
            },
          })
        )
      )
    );
  }

  /**
   * Stores references to proof requests created in tests (not via seeding)
   */
  public addAdHocKey(key: ProofRequestKey) {
    this.adHocKeys.push(key);
  }

  /**
   * Delete proof requests referenced by calls to addAdHocKey from database
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
}
