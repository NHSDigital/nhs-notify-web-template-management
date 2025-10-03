import {
  paginateQuery,
  type DynamoDBDocumentClient,
  type NativeAttributeValue,
  type QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { ApplicationResult, failure, success } from '@backend-api/utils/result';
import {
  $RoutingConfig,
  ErrorCase,
  type RoutingConfig,
  type RoutingConfigStatus,
} from 'nhs-notify-backend-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';

export class RoutingConfigQuery {
  private includeStatuses: RoutingConfigStatus[] = [];
  private excludeStatuses: RoutingConfigStatus[] = [];
  private returnCount = false;

  constructor(
    private readonly docClient: DynamoDBDocumentClient,
    private readonly tableName: string,
    private readonly owner: string
  ) {}

  /** Include items with any of the given statuses. */
  status(...statuses: RoutingConfigStatus[]) {
    this.includeStatuses.push(...statuses);
    return this;
  }

  /** Exclude items with any of the given statuses. */
  excludeStatus(...statuses: RoutingConfigStatus[]) {
    this.excludeStatuses.push(...statuses);
    return this;
  }

  /** Execute the query and return a list of all matching RoutingConfigs */
  async list(): Promise<ApplicationResult<RoutingConfig[]>> {
    try {
      this.returnCount = false;

      const query = this.build();

      const collected: RoutingConfig[] = [];

      const paginator = paginateQuery({ client: this.docClient }, query);

      for await (const page of paginator) {
        for (const item of page.Items ?? []) {
          const parsed = $RoutingConfig.safeParse(item);
          if (parsed.success) {
            collected.push(parsed.data);
          } else {
            logger.warn('Filtered out invalid RoutingConfig item', {
              owner: this.owner,
              id: item.id,
              issues: parsed.error.issues,
            });
          }
        }
      }

      return success(collected);
    } catch (error) {
      return failure(
        ErrorCase.INTERNAL,
        'Error listing Routing Configs',
        error
      );
    }
  }

  /** Execute the query and return a count of all matching RoutingConfigs */
  async count(): Promise<ApplicationResult<{ count: number }>> {
    try {
      this.returnCount = true;

      const query = this.build();

      let count = 0;

      const paginator = paginateQuery({ client: this.docClient }, query);

      for await (const page of paginator) {
        if (page.Count) {
          count += page.Count;
        }
      }

      return success({ count });
    } catch (error) {
      return failure(
        ErrorCase.INTERNAL,
        'Error counting Routing Configs',
        error
      );
    }
  }

  private build() {
    const query: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: '#owner = :owner',
    };

    const ExpressionAttributeNames: Record<string, string> = {
      '#owner': 'owner',
    };

    const ExpressionAttributeValues: Record<string, NativeAttributeValue> = {
      ':owner': this.owner,
    };

    query.ExpressionAttributeNames = ExpressionAttributeNames;
    query.ExpressionAttributeValues = ExpressionAttributeValues;

    const filters: string[] = [];

    if (this.includeStatuses.length + this.excludeStatuses.length > 0) {
      ExpressionAttributeNames['#status'] = 'status';
    }

    if (this.includeStatuses.length > 0) {
      const uniq = [...new Set(this.includeStatuses)];
      const placeholders: string[] = [];

      for (const [i, s] of uniq.entries()) {
        const ph = `:status${i}`;
        ExpressionAttributeValues[ph] = s;
        placeholders.push(ph);
      }
      filters.push(`(#status IN (${placeholders.join(', ')}))`);
    }

    if (this.excludeStatuses.length > 0) {
      const uniq = [...new Set(this.excludeStatuses)];
      const parts: string[] = [];
      for (const [i, s] of uniq.entries()) {
        const ph = `:notStatus${i}`;
        ExpressionAttributeValues[ph] = s;
        parts.push(`#status <> ${ph}`);
      }
      filters.push(`(${parts.join(' AND ')})`);
    }

    if (filters.length > 0) {
      query.FilterExpression = filters.join(' AND ');
    }

    if (this.returnCount) {
      query.Select = 'COUNT';
    }

    return query;
  }
}
