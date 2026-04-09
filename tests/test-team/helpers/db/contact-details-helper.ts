import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import { chunk } from 'helpers/chunk';
import { FactoryContactDetail } from 'helpers/factories/contact-details-factory';

export type ContactDetailKey = {
  clientId: string;
  type: string;
  value: string;
};

export class ContactDetailHelper {
  private readonly dynamo = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: 'eu-west-2' })
  );

  private readonly startTime = Math.floor(Date.now() / 1000);

  private adHocKeys: ContactDetailKey[] = [];
  private seedData: ContactDetailKey[] = [];
  /**
   * Stores references to contact details created in tests (not via seeding)
   */
  public addAdHoc(key: ContactDetailKey) {
    this.adHocKeys.push(key);
  }

  /**
   * Seed a load of contact details into the database
   */
  async seed(data: FactoryContactDetail[]) {
    this.seedData.push(...data);

    const chunks = chunk(data);

    await Promise.all(
      chunks.map(async (batch) => {
        await this.dynamo.send(
          new BatchWriteCommand({
            RequestItems: {
              [process.env.CONTACT_DETAILS_TABLE_NAME]: batch.map((item) => ({
                PutRequest: {
                  Item: {
                    PK: `CLIENT#${item.clientId}`,
                    SK: `${item.type}#${item.value}`,
                    ...item,
                  },
                },
              })),
            },
          })
        );
      })
    );
  }

  /**
   * Delete contact details referenced by calls to addAdHoc
   */
  async deleteAdHoc() {
    await this.delete(this.adHocKeys);
    this.adHocKeys = [];
  }

  /**
   * Delete contact details seeded by calls to `seed`
   */
  public async deleteSeeded() {
    await this.delete(this.seedData);
    this.seedData = [];
  }

  /**
   * Delete all seeded and adhoc contact details
   */
  public async cleanup() {
    await Promise.all([this.deleteAdHoc(), this.deleteSeeded()]);
  }

  private async delete(keys: ContactDetailKey[]) {
    const dbChunks = chunk(keys);

    await Promise.all(
      dbChunks.map((batch) =>
        this.dynamo.send(
          new BatchWriteCommand({
            RequestItems: {
              [process.env.CONTACT_DETAILS_TABLE_NAME]: batch.map((key) => ({
                DeleteRequest: {
                  Key: {
                    PK: `CLIENT#${key.clientId}`,
                    SK: `${key.type}#${key.value}`,
                  },
                },
              })),
            },
          })
        )
      )
    );
  }
}
