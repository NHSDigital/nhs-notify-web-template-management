import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { z } from 'zod/v4';
import { $LetterVariant } from 'nhs-notify-backend-client';
import type { LetterVariant } from 'nhs-notify-web-template-management-types';

import GLOBAL_VARIANTS from 'fixtures/global-letter-variants.json';
import { chunk } from 'helpers/chunk';
import type { TestContextFile } from 'helpers/context/context-file';
import { makeLetterVariant } from 'helpers/factories/letter-variant-factory';

export class LetterVariantStorageHelper {
  private readonly dynamo: DynamoDBDocumentClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: 'eu-west-2' })
  );

  constructor(private contextFile: TestContextFile) {}

  async setup() {
    const data = await this.buildSeedData();

    await Promise.all(
      chunk(data).map(async (batch) => {
        await Promise.all([
          this.dynamo.send(
            new BatchWriteCommand({
              RequestItems: {
                [process.env.LETTER_VARIANTS_TABLE_NAME]: batch.map((item) => ({
                  PutRequest: { Item: this.getPutRequestItem(item) },
                })),
              },
            })
          ),

          this.contextFile.setLetterVariants(
            Object.fromEntries(batch.map((item) => [item.id, item]))
          ),
        ]);
      })
    );
  }

  public async teardown() {
    const variants = await this.contextFile.getAllLetterVariants();

    await Promise.all(
      chunk(variants).map((batch) =>
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
  }

  public async createLetterVariant(variant: LetterVariant) {
    await Promise.all([
      this.dynamo.send(
        new PutCommand({
          TableName: process.env.LETTER_VARIANTS_TABLE_NAME,
          Item: this.getPutRequestItem(variant),
        })
      ),

      this.contextFile.setLetterVariant(variant.id, variant),
    ]);
  }

  public async getGlobalLetterVariants() {
    const variants = await this.contextFile.getAllLetterVariants();

    return variants.filter(
      (variant) => !variant.clientId && !variant.campaignId
    );
  }

  public async getClientScopedLetterVariants(clientId: string) {
    const variants = await this.contextFile.getAllLetterVariants();

    return variants.filter(
      (variant) => variant.clientId === clientId && !variant.campaignId
    );
  }

  public async getCampaignScopedLetterVariants(
    clientId: string,
    campaignId: string
  ) {
    const variants = await this.contextFile.getAllLetterVariants();

    return variants.filter(
      (variant) =>
        variant.clientId === clientId && variant.campaignId === campaignId
    );
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

  private async buildSeedData(): Promise<LetterVariant[]> {
    // Ensure that the static data conforms to the expected schema
    const parsedGlobalVariants = z.array($LetterVariant).parse(GLOBAL_VARIANTS);

    const clients = await this.contextFile.getAllClients();

    // Each client gets one client scoped variant
    // and each client campaign get one campaign scoped variant
    const clientVariants = clients.flatMap(([clientId, client]) => [
      makeLetterVariant({
        clientId,
        name: `Client Letter Variant - ${client.name}`,
      }),
      ...(client.campaignIds ?? []).map((campaignId) =>
        makeLetterVariant({
          clientId,
          campaignId,
          name: `Campaign Letter Variant - ${campaignId}`,
        })
      ),
    ]);

    return [...parsedGlobalVariants, ...clientVariants];
  }

  private getPutRequestItem(variant: LetterVariant) {
    return {
      ...variant,
      PK: `VARIANT#${variant.id}`,
      SK: 'METADATA',
      ByScopeIndexPK: this.getScopePk(variant),
      ByScopeIndexSK: `${variant.type}#${variant.status}#${variant.id}`,
    };
  }
}
