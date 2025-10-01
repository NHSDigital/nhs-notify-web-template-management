import { randomUUID } from 'node:crypto';
import {
  GetCommand,
  PutCommand,
  type DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import {
  type ApplicationResult,
  failure,
  success,
} from '@backend-api/utils/result';
import {
  $RoutingConfig,
  type CreateUpdateRoutingConfig,
  ErrorCase,
  type RoutingConfig,
} from 'nhs-notify-backend-client';
import { User } from 'nhs-notify-web-template-management-utils';

export class RoutingConfigRepository {
  constructor(
    private readonly client: DynamoDBDocumentClient,
    private readonly tableName: string
  ) {}

  async create(routingConfigInput: CreateUpdateRoutingConfig, user: User) {
    const date = new Date().toISOString();

    const routingConfig: RoutingConfig = {
      ...routingConfigInput,
      clientId: user.clientId,
      createdAt: date,
      id: randomUUID(),
      status: 'DRAFT',
      updatedAt: date,
      updatedBy: user.userId,
    };

    try {
      await this.client.send(
        new PutCommand({
          TableName: this.tableName,
          Item: { ...routingConfig, owner: this.clientOwnerKey(user.clientId) },
        })
      );

      return success(routingConfig);
    } catch (error) {
      return failure(
        ErrorCase.INTERNAL,
        'Failed to create routing config',
        error
      );
    }
  }

  async get(id: string, user: User): Promise<ApplicationResult<RoutingConfig>> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          id,
          owner: this.clientOwnerKey(user.clientId),
        },
      })
    );

    if (!result.Item) {
      return failure(ErrorCase.NOT_FOUND, 'Routing Config not found');
    }

    const parsed = $RoutingConfig.safeParse(result.Item);

    if (!parsed.success) {
      return failure(
        ErrorCase.INTERNAL,
        'Error retrieving Routing Config',
        parsed.error
      );
    }

    return success(parsed.data);
  }

  private clientOwnerKey(clientId: string) {
    return `CLIENT#${clientId}`;
  }
}
