import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  QueryCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { $LetterVariant, ErrorCase } from 'nhs-notify-backend-client';
import type { LetterVariant } from 'nhs-notify-web-template-management-types';
import { InMemoryCache } from 'nhs-notify-web-template-management-utils';
import { type ApplicationResult, success, failure } from '@backend-api/utils';

type ScopeIndex = Pick<LetterVariant, 'clientId' | 'campaignId'>;

export type LetterVariantQueryFilters = Partial<
  Pick<LetterVariant, 'type' | 'status'>
>;

export class LetterVariantRepository {
  private readonly byIdCache: InMemoryCache<LetterVariant>;
  private readonly byScopeCache: InMemoryCache<LetterVariant[]>;

  constructor(
    private readonly client: DynamoDBDocumentClient,
    private readonly tableName: string,
    cacheTtlMs: number
  ) {
    this.byIdCache = new InMemoryCache<LetterVariant>(cacheTtlMs);
    this.byScopeCache = new InMemoryCache<LetterVariant[]>(cacheTtlMs);
  }

  async put(variant: LetterVariant): Promise<ApplicationResult<LetterVariant>> {
    let parsed: LetterVariant;

    try {
      parsed = $LetterVariant.parse(variant);
    } catch (error) {
      return failure(
        ErrorCase.VALIDATION_FAILED,
        'Invalid Letter Variant',
        error
      );
    }

    try {
      await this.client.send(
        new PutCommand({
          TableName: this.tableName,
          Item: {
            ...parsed,
            PK: `VARIANT#${parsed.id}`,
            SK: 'METADATA',
            ByScopeIndexPK: this.getScopePk(parsed),
            ByScopeIndexSK: `${parsed.type}#${parsed.status}#${parsed.id}`,
          },
        })
      );

      this.byIdCache.set(parsed.id, parsed);
      this.byScopeCache.clear();
    } catch (error) {
      return failure(
        ErrorCase.INTERNAL,
        'Error writing Letter Variant to database',
        error
      );
    }

    return success(parsed);
  }

  async getById(id: string): Promise<ApplicationResult<LetterVariant>> {
    const cached = this.byIdCache.get(id);

    if (cached) {
      return success(cached);
    }

    try {
      const { Item } = await this.client.send(
        new GetCommand({
          TableName: this.tableName,
          Key: {
            PK: `VARIANT#${id}`,
            SK: 'METADATA',
          },
        })
      );

      if (!Item) {
        return failure(ErrorCase.NOT_FOUND, 'Letter Variant not found');
      }

      const variant = $LetterVariant.parse(Item);

      this.byIdCache.set(id, variant);

      return success(variant);
    } catch (error) {
      return failure(
        ErrorCase.INTERNAL,
        'Error fetching Letter Variant from database',
        error
      );
    }
  }

  async getGlobalLetterVariants(
    filters?: LetterVariantQueryFilters
  ): Promise<ApplicationResult<LetterVariant[]>> {
    return this.queryByScope(this.getScopePk({}), filters);
  }

  async getClientScopedLetterVariants(
    clientId: string,
    filters?: LetterVariantQueryFilters
  ): Promise<ApplicationResult<LetterVariant[]>> {
    return this.queryByScope(this.getScopePk({ clientId }), filters);
  }

  async getCampaignScopedLetterVariants(
    clientId: string,
    campaignId: string,
    filters?: LetterVariantQueryFilters
  ): Promise<ApplicationResult<LetterVariant[]>> {
    return this.queryByScope(
      this.getScopePk({ clientId, campaignId }),
      filters
    );
  }

  private async queryByScope(
    scope: string,
    filters?: LetterVariantQueryFilters
  ): Promise<ApplicationResult<LetterVariant[]>> {
    const scopeCacheKey = this.getScopeCacheKey(scope, filters);

    const cached = this.byScopeCache.get(scopeCacheKey);

    if (cached) {
      return success([...cached]);
    }

    const items: unknown[] = [];
    let lastEvaluatedKey: QueryCommandOutput['LastEvaluatedKey'];

    const expressionAttributeNames: Record<string, string> = {
      '#pk': 'ByScopeIndexPK',
    };

    const expressionAttributeValues: Record<string, string> = {
      ':scope': scope,
    };

    let keyConditionExpression = '#pk = :scope';
    let filterExpression: string | undefined;

    if (filters?.type) {
      expressionAttributeNames['#sk'] = 'ByScopeIndexSK';
      expressionAttributeValues[':skPrefix'] = `${filters.type}#`;
      keyConditionExpression += ' AND begins_with(#sk, :skPrefix)';

      if (filters.status) {
        expressionAttributeValues[':skPrefix'] += `${filters.status}#`;
      }
    } else if (filters?.status) {
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = filters.status;
      filterExpression = '#status = :status';
    }

    do {
      try {
        const { Items = [], LastEvaluatedKey } = await this.client.send(
          new QueryCommand({
            TableName: this.tableName,
            IndexName: 'ByScope',
            KeyConditionExpression: keyConditionExpression,
            FilterExpression: filterExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ExclusiveStartKey: lastEvaluatedKey,
          })
        );

        items.push(...Items);
        lastEvaluatedKey = LastEvaluatedKey;
      } catch (error) {
        return failure(
          ErrorCase.INTERNAL,
          'Error querying letter variants',
          error
        );
      }
    } while (lastEvaluatedKey);

    const parsed = this.parseList(items);

    this.byScopeCache.set(scopeCacheKey, [...parsed]);

    return success(parsed);
  }

  private parseList(items: unknown[]): LetterVariant[] {
    return items
      .map((item) => {
        const { data } = $LetterVariant.safeParse(item);

        return data;
      })
      .filter((item) => item !== undefined);
  }

  private getScopePk({ clientId, campaignId }: ScopeIndex) {
    if (campaignId && clientId) {
      return `CAMPAIGN#${clientId}#${campaignId}`;
    }

    if (clientId) {
      return `CLIENT#${clientId}`;
    }

    return 'GLOBAL';
  }

  private getScopeCacheKey(scope: string, filters?: LetterVariantQueryFilters) {
    return `${scope}|${filters?.type ?? ''}|${filters?.status ?? ''}`;
  }
}
