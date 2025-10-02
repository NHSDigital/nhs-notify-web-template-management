import { GetCommand, type DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { ApplicationResult, failure, success } from '@backend-api/utils/result';
import {
  $RoutingConfig,
  ErrorCase,
  type RoutingConfig,
} from 'nhs-notify-backend-client';
import { RoutingConfigQuery } from './query';

export class RoutingConfigRepository {
  constructor(
    private readonly client: DynamoDBDocumentClient,
    private readonly tableName: string
  ) {}

  async get(
    id: string,
    owner: string
  ): Promise<ApplicationResult<RoutingConfig>> {
    try {
      const result = await this.client.send(
        new GetCommand({
          TableName: this.tableName,
          Key: {
            id,
            owner,
          },
        })
      );

      if (!result.Item) {
        return failure(ErrorCase.NOT_FOUND, 'Routing Config not found');
      }

      const parsed = $RoutingConfig.parse(result.Item);

      return success(parsed);
    } catch (error) {
      return failure(
        ErrorCase.INTERNAL,
        'Error retrieving Routing Config',
        error
      );
    }
  }

  query(owner: string): RoutingConfigQuery {
    return new RoutingConfigQuery(this.client, this.tableName, owner);
  }
}
