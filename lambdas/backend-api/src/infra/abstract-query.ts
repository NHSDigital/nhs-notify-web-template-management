import { z } from 'zod/v4';
import {
  paginateQuery,
  type DynamoDBDocumentClient,
  type NativeAttributeValue,
  type QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { ApplicationResult, failure, success } from '@backend-api/utils/result';
import { ErrorCase } from 'nhs-notify-backend-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';

export type FilterAction = 'INCLUDE' | 'EXCLUDE';

export abstract class AbstractQuery<T> {
  private returnCount = false;

  private ExpressionAttributeNames: Record<string, string> = {};
  private ExpressionAttributeValues: Record<string, NativeAttributeValue> = {};
  private filters: string[] = [];

  constructor(
    private readonly docClient: DynamoDBDocumentClient,
    private readonly objectName: string,
    private readonly objectSchema: z.ZodType<T>,
    private readonly tableName: string,
    private readonly owner: string
  ) {}

  /** Execute the query and return a list of all matching items */
  async list(): Promise<ApplicationResult<T[]>> {
    try {
      this.returnCount = false;

      const query = this.build();

      const collected: T[] = [];

      const paginator = paginateQuery({ client: this.docClient }, query);

      for await (const page of paginator) {
        for (const item of page.Items ?? []) {
          const parsed = this.objectSchema.safeParse(item);
          if (parsed.success) {
            collected.push(parsed.data);
          } else {
            logger.warn(`Filtered out invalid ${this.objectName} item`, {
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
        `Error listing ${this.objectName}s`,
        error
      );
    }
  }

  /** Execute the query and return a count of all matching items */
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
        `Error counting ${this.objectName}s`,
        error
      );
    }
  }

  private build() {
    this.ExpressionAttributeNames['#owner'] = 'owner';
    this.ExpressionAttributeValues[':owner'] = this.owner;

    this.addFilters();

    const query: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: '#owner = :owner',
      ExpressionAttributeNames: this.ExpressionAttributeNames,
      ExpressionAttributeValues: this.ExpressionAttributeValues,
    };

    if (this.filters.length > 0) {
      query.FilterExpression = this.filters.join(' AND ');
    }

    if (this.returnCount) {
      query.Select = 'COUNT';
    }

    return query;
  }

  protected abstract addFilters(): void;

  protected addFilterToQuery(
    fieldName: string,
    action: FilterAction,
    fieldValues: string[]
  ) {
    if (fieldValues.length > 0) {
      const attributeName = `#${fieldName}`;
      if (!this.ExpressionAttributeNames[attributeName]) {
        this.ExpressionAttributeNames[attributeName] = fieldName;
      }

      const uniqueValues = [...new Set(fieldValues)];
      const attributeValues: string[] = [];

      for (const [i, value] of uniqueValues.entries()) {
        const attributeValue = `:${action === 'EXCLUDE' ? 'not' : ''}${fieldName}${i}`;
        this.ExpressionAttributeValues[attributeValue] = value;
        attributeValues.push(attributeValue);
      }

      this.filters.push(
        `${action === 'EXCLUDE' ? 'NOT' : ''}(${attributeName} IN (${attributeValues.join(', ')}))`
      );
    }
  }
}
