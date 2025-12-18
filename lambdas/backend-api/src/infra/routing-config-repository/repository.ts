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
  type CreateRoutingConfig,
  ErrorCase,
  type RoutingConfig,
  RoutingConfigStatus,
  type UpdateRoutingConfig,
} from 'nhs-notify-backend-client';
import type { User } from 'nhs-notify-web-template-management-utils';
import { RoutingConfigQuery } from './query';
import { RoutingConfigUpdateBuilder } from 'nhs-notify-entity-update-command-builder';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { calculateTTL } from '@backend-api/utils/calculate-ttl';
import { unmarshall } from '@aws-sdk/util-dynamodb';

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
    routingConfigInput: CreateRoutingConfig,
    user: User
  ): Promise<ApplicationResult<RoutingConfig>> {
    const date = new Date().toISOString();

    try {
      const routingConfig = $RoutingConfig.parse({
        ...routingConfigInput,
        clientId: user.clientId,
        createdAt: date,
        defaultCascadeGroup: 'standard',
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
            updatedBy: this.internalUserKey(user),
            createdBy: this.internalUserKey(user),
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
    updateData: UpdateRoutingConfig,
    user: User,
    lockNumber: number
  ): Promise<ApplicationResult<RoutingConfig>> {
    const { campaignId, cascade, cascadeGroupOverrides, name } = updateData;

    const update = new RoutingConfigUpdateBuilder(
      this.tableName,
      user.clientId,
      id,
      this.updateCmdOpts
    );

    if (name) {
      update.setName(name);
    }

    if (campaignId) {
      update.setCampaignId(campaignId);
    }

    if (cascade && cascadeGroupOverrides) {
      update
        .setCascade(cascade)
        .setCascadeGroupOverrides(cascadeGroupOverrides);
    }
    update
      .setUpdatedByUserAt(this.internalUserKey(user))
      .expectStatus('DRAFT')
      .expectLockNumber(lockNumber)
      .incrementLockNumber();

    try {
      const result = await this.client.send(new UpdateCommand(update.build()));

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
      return this.handleUpdateError(error, lockNumber);
    }
  }

  async submit(
    id: string,
    user: User,
    lockNumber: number
  ): Promise<ApplicationResult<RoutingConfig>> {
    const cmdInput = new RoutingConfigUpdateBuilder(
      this.tableName,
      user.clientId,
      id,
      this.updateCmdOpts
    )
      .setStatus('COMPLETED')
      .expectStatus('DRAFT')
      .setUpdatedByUserAt(this.internalUserKey(user))
      .expectLockNumber(lockNumber)
      .incrementLockNumber()
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
      return this.handleUpdateError(error, lockNumber);
    }
  }

  async delete(
    id: string,
    user: User,
    lockNumber: number
  ): Promise<ApplicationResult<RoutingConfig>> {
    const cmdInput = new RoutingConfigUpdateBuilder(
      this.tableName,
      user.clientId,
      id,
      this.updateCmdOpts
    )
      .setStatus('DELETED')
      .setTtl(calculateTTL())
      .expectStatus('DRAFT')
      .setUpdatedByUserAt(this.internalUserKey(user))
      .expectLockNumber(lockNumber)
      .incrementLockNumber()
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
      return this.handleUpdateError(error, lockNumber);
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

  private handleUpdateError(err: unknown, expectedLockNumber: number) {
    if (err instanceof ConditionalCheckFailedException) {
      const item = unmarshall(err.Item ?? {});

      if (
        !err.Item ||
        item.status === ('DELETED' satisfies RoutingConfigStatus)
      ) {
        return failure(ErrorCase.NOT_FOUND, `Routing configuration not found`);
      }

      if (item.status === ('COMPLETED' satisfies RoutingConfigStatus)) {
        return failure(
          ErrorCase.ALREADY_SUBMITTED,
          `Routing configuration with status COMPLETED cannot be updated`
        );
      }

      if (item.lockNumber !== expectedLockNumber) {
        return failure(
          ErrorCase.CONFLICT,
          'Lock number mismatch - Message Plan has been modified since last read',
          err
        );
      }
    }

    return failure(ErrorCase.INTERNAL, 'Failed to update routing config', err);
  }

  private clientOwnerKey(clientId: string) {
    return `CLIENT#${clientId}`;
  }

  private internalUserKey(user: User) {
    return `INTERNAL_USER#${user.internalUserId}`;
  }
}
