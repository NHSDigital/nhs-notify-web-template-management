import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import { chunk } from 'helpers/chunk';
import type { LetterVariant } from 'nhs-notify-backend-client';

export class LetterVariantStorageHelper {
  private readonly dynamo: DynamoDBDocumentClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: 'eu-west-2' })
  );

  private seedData: LetterVariant[] = [];

  /**
   * Seed a load of letter variants into the database
   */
  async seed(data: LetterVariant[]) {
    this.seedData.push(...data);

    await Promise.all(
      chunk(data).map(async (batch) => {
        await this.dynamo.send(
          new BatchWriteCommand({
            RequestItems: {
              [process.env.LETTER_VARIANTS_TABLE_NAME]: batch.map((item) => ({
                PutRequest: {
                  Item: {
                    ...item,
                    PK: `VARIANT#${item.id}`,
                    SK: 'METADATA',
                    ByScopeIndexPK: this.getScopePk(item),
                    ByScopeIndexSK: `${item.type}#${item.status}#${item.id}`,
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
   * Delete letter variants seeded by calls to seed
   */
  public async deleteSeeded() {
    await Promise.all(
      chunk(this.seedData).map((batch) =>
        this.dynamo.send(
          new BatchWriteCommand({
            RequestItems: {
              [process.env.LETTER_VARIANTS_TABLE_NAME]: batch.map(({ id }) => ({
                DeleteRequest: {
                  Key: {
                    PK: `VARIANT#${id}`,
                    SK: 'METADATA',
                  },
                },
              })),
            },
          })
        )
      )
    );

    this.seedData = [];
  }

  private getScopePk({ clientId, campaignId }: LetterVariant) {
    if (campaignId && clientId) {
      return `CAMPAIGN#${clientId}#${campaignId}`;
    }

    if (clientId) {
      return `CLIENT#${clientId}`;
    }

    return 'GLOBAL';
  }
}
