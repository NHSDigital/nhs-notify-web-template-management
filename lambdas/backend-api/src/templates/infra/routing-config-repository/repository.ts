import { randomUUID } from 'node:crypto';
import {
  GetCommand,
  PutCommand,
  UpdateCommand,
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
  RoutingConfigStatus,
} from 'nhs-notify-backend-client';
import type { User } from 'nhs-notify-web-template-management-utils';
import { RoutingConfigQuery } from './query';
import { RoutingConfigUpdateBuilder } from 'nhs-notify-entity-update-command-builder';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { calculateTTL } from '@backend-api/utils/calculate-ttl';

export class RoutingConfigRepository {
  private updateCmdOpts = {
    ReturnValues: 'ALL_NEW',
    ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
  } as const;

  constructor(
    private readonly client: DynamoDBDocumentClient,
    private readonly tableName: string
  ) {}

  async create(
    routingConfigInput: CreateUpdateRoutingConfig,
    user: User
  ): Promise<ApplicationResult<RoutingConfig>> {
    const date = new Date().toISOString();

    try {
      const routingConfig = $RoutingConfig.parse({
        ...routingConfigInput,
        clientId: user.clientId,
        createdAt: date,
        id: randomUUID(),
        status: 'DRAFT',
        updatedAt: date,
      });

      await this.client.send(
        new PutCommand({
          TableName: this.tableName,
          Item: {
            ...routingConfig,
            owner: this.clientOwnerKey(user.clientId),
            updatedBy: user.userId,
            createdBy: user.userId,
          },
          ConditionExpression: 'attribute_not_exists(id)',
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

  async update(
    id: string,
    updateData: CreateUpdateRoutingConfig,
    user: User
  ): Promise<ApplicationResult<RoutingConfig>> {
    const { campaignId, cascade, cascadeGroupOverrides, name } = updateData;

    const cmdInput = new RoutingConfigUpdateBuilder(
      this.tableName,
      user.clientId,
      id,
      this.updateCmdOpts
    )
      .setUpdatedByUserAt(user.userId)
      .setCampaignId(campaignId)
      .setCascade(cascade)
      .setName(name)
      .setCascadeGroupOverrides(cascadeGroupOverrides)
      .expectedStatus('DRAFT')
      .build();

    try {
      const result = await this.client.send(new UpdateCommand(cmdInput));

      const parsed = $RoutingConfig.safeParse(result.Attributes);

      if (!parsed.success) {
        return failure(
          ErrorCase.INTERNAL,
          'Error parsing updated Routing Config',
          parsed.error
        );
      }

      return success(parsed.data);
    } catch (error) {
      return this.handleUpdateError(error);
    }
  }

  async submit(
    id: string,
    user: User
  ): Promise<ApplicationResult<RoutingConfig>> {
    const cmdInput = new RoutingConfigUpdateBuilder(
      this.tableName,
      user.clientId,
      id,
      this.updateCmdOpts
    )
      .setStatus('COMPLETED')
      .expectedStatus('DRAFT')
      .setUpdatedByUserAt(user.userId)
      .build();

    try {
      const result = await this.client.send(new UpdateCommand(cmdInput));

      const parsed = $RoutingConfig.safeParse(result.Attributes);

      if (!parsed.success) {
        return failure(
          ErrorCase.INTERNAL,
          'Error parsing submitted Routing Config',
          parsed.error
        );
      }

      return success(parsed.data);
    } catch (error) {
      return this.handleUpdateError(error);
    }
  }

  async delete(
    id: string,
    user: User
  ): Promise<ApplicationResult<RoutingConfig>> {
    const cmdInput = new RoutingConfigUpdateBuilder(
      this.tableName,
      user.clientId,
      id,
      this.updateCmdOpts
    )
      .setStatus('DELETED')
      .setTtl(calculateTTL())
      .expectedStatus('DRAFT')
      .setUpdatedByUserAt(user.userId)
      .build();

    try {
      const result = await this.client.send(new UpdateCommand(cmdInput));

      const parsed = $RoutingConfig.safeParse(result.Attributes);

      if (!parsed.success) {
        return failure(
          ErrorCase.INTERNAL,
          'Error parsing deleted Routing Config',
          parsed.error
        );
      }

      return success(parsed.data);
    } catch (error) {
      return this.handleUpdateError(error);
    }
  }

  async get(
    id: string,
    clientId: string
  ): Promise<ApplicationResult<RoutingConfig>> {
    try {
      const result = await this.client.send(
        new GetCommand({
          TableName: this.tableName,
          Key: {
            id,
            owner: this.clientOwnerKey(clientId),
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

  query(clientId: string): RoutingConfigQuery {
    return new RoutingConfigQuery(
      this.client,
      this.tableName,
      this.clientOwnerKey(clientId)
    );
  }

  private handleUpdateError(err: unknown) {
    if (err instanceof ConditionalCheckFailedException) {
      const status = err?.Item?.status.S;

      if (!status || status === ('DELETED' satisfies RoutingConfigStatus)) {
        return failure(ErrorCase.NOT_FOUND, `Routing configuration not found`);
      }

      if (status === ('COMPLETED' satisfies RoutingConfigStatus)) {
        return failure(
          ErrorCase.ALREADY_SUBMITTED,
          `Routing configuration with status COMPLETED cannot be updated`
        );
      }
    }

    return failure(ErrorCase.INTERNAL, 'Failed to update routing config', err);
  }

  private clientOwnerKey(clientId: string) {
    return `CLIENT#${clientId}`;
  }
}
