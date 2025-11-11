import { randomUUID } from 'node:crypto';
import {
  GetCommand,
  PutCommand,
  TransactWriteCommand,
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
import {
  RoutingConfigUpdateBuilder,
  TemplateUpdateBuilder,
} from 'nhs-notify-entity-update-command-builder';
import {
  ConditionalCheckFailedException,
  TransactionCanceledException,
} from '@aws-sdk/client-dynamodb';
import { calculateTTL } from '@backend-api/utils/calculate-ttl';
import { getCascadeTemplateIds } from '@backend-api/domain/get-cascade-template-ids';

export class RoutingConfigRepository {
  private updateCmdOpts = {
    ReturnValues: 'ALL_NEW',
    ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
  } as const;

  constructor(
    private readonly client: DynamoDBDocumentClient,
    private readonly config: {
      routingConfigTableName: string;
      templatesTableName: string;
    }
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
          TableName: this.config.routingConfigTableName,
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
        'Failed to create Routing Config',
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
      this.config.routingConfigTableName,
      user.clientId,
      id,
      this.updateCmdOpts
    )
      .setUpdatedByUserAt(user.userId)
      .setCampaignId(campaignId)
      .setCascade(cascade)
      .setName(name)
      .setCascadeGroupOverrides(cascadeGroupOverrides)
      .expectStatus('DRAFT')
      .build();

    try {
      const result = await this.client.send(new UpdateCommand(cmdInput));

      const parsed = $RoutingConfig.safeParse(result.Attributes);

      if (!parsed.success) {
        return failure(
          ErrorCase.INTERNAL,
          'Error parsing Routing Config',
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
    const getRoutingConfigResult = await this.get(id, user.clientId);

    if (getRoutingConfigResult.error) return getRoutingConfigResult;

    if (getRoutingConfigResult.data.status === 'DELETED') {
      return failure(ErrorCase.NOT_FOUND, 'Routing Config not found');
    }

    const now = new Date();

    const routingConfigUpdate = new RoutingConfigUpdateBuilder(
      this.config.routingConfigTableName,
      user.clientId,
      id,
      this.updateCmdOpts
    )
      .setStatus('COMPLETED')
      .expectRoutingConfigExists()
      .expectStatus('DRAFT')
      .setUpdatedByUserAt(user.userId, now);

    const referencedTemplateIds = getCascadeTemplateIds(
      getRoutingConfigResult.data.cascade
    );

    const templateUpdates = referencedTemplateIds.map((templateId) => ({
      Update: new TemplateUpdateBuilder(
        this.config.templatesTableName,
        user.clientId,
        templateId,
        this.updateCmdOpts
      )
        .setStatus('LOCKED')
        .expectTemplateExists()
        .expectStatusByType(
          ['NHS_APP', ['NOT_YET_SUBMITTED', 'LOCKED']],
          ['EMAIL', ['NOT_YET_SUBMITTED', 'LOCKED']],
          ['SMS', ['NOT_YET_SUBMITTED', 'LOCKED']],
          ['LETTER', ['SUBMITTED', 'LOCKED']]
        )
        .incrementLockNumber()
        .setUpdatedByUserAt(user.userId, now)
        .build(),
    }));

    try {
      await this.client.send(
        new TransactWriteCommand({
          ClientRequestToken: randomUUID(),
          TransactItems: [
            {
              Update: routingConfigUpdate.build(),
            },
            ...templateUpdates,
          ],
        })
      );

      return this.get(id, user.clientId);
    } catch (error) {
      return this.handleSubmitError(error);
    }
  }

  async delete(
    id: string,
    user: User
  ): Promise<ApplicationResult<RoutingConfig>> {
    const cmdInput = new RoutingConfigUpdateBuilder(
      this.config.routingConfigTableName,
      user.clientId,
      id,
      this.updateCmdOpts
    )
      .setStatus('DELETED')
      .setTtl(calculateTTL())
      .expectStatus('DRAFT')
      .setUpdatedByUserAt(user.userId)
      .build();

    try {
      const result = await this.client.send(new UpdateCommand(cmdInput));

      const parsed = $RoutingConfig.safeParse(result.Attributes);

      if (!parsed.success) {
        return failure(
          ErrorCase.INTERNAL,
          'Error parsing Routing Config',
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
    let data: unknown;

    try {
      const result = await this.client.send(
        new GetCommand({
          TableName: this.config.routingConfigTableName,
          Key: {
            id,
            owner: this.clientOwnerKey(clientId),
          },
        })
      );

      if (!result.Item) {
        return failure(ErrorCase.NOT_FOUND, 'Routing Config not found');
      }

      data = result.Item;
    } catch (error) {
      return failure(
        ErrorCase.INTERNAL,
        'Error retrieving Routing Config',
        error
      );
    }

    const parsed = $RoutingConfig.safeParse(data);

    if (parsed.success) {
      return success(parsed.data);
    }

    return failure(
      ErrorCase.INTERNAL,
      'Error parsing Routing Config',
      parsed.error
    );
  }

  query(clientId: string): RoutingConfigQuery {
    return new RoutingConfigQuery(
      this.client,
      this.config.routingConfigTableName,
      this.clientOwnerKey(clientId)
    );
  }

  private handleUpdateError(err: unknown) {
    if (err instanceof ConditionalCheckFailedException) {
      const status = err?.Item?.status.S;

      if (!status || status === ('DELETED' satisfies RoutingConfigStatus)) {
        return failure(ErrorCase.NOT_FOUND, 'Routing Config not found');
      }

      if (status === ('COMPLETED' satisfies RoutingConfigStatus)) {
        return failure(
          ErrorCase.ALREADY_SUBMITTED,
          `Routing Config with status COMPLETED cannot be updated`
        );
      }
    }

    return failure(ErrorCase.INTERNAL, 'Failed to update Routing Config', err);
  }

  private handleSubmitError(err: unknown) {
    // TODO: CCM-12744
    // TODO: CCM-12685
    // Since we are reading the item(s) before writing, we can probably remove all of this condition checking logic
    // Do validation on the items that are retrieved from the database before writing (including the lock number)
    // On write, just add a condition check on the lock number to check it's not changed since validation

    // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_TransactWriteItems.html#API_TransactWriteItems_Errors
    if (
      err instanceof TransactionCanceledException &&
      err.CancellationReasons
    ) {
      // Cancellation reasons is an array that maps to the requests in the transactions - i.e same indexes.
      const [routingConfigReason, ...templateReasons] = err.CancellationReasons;

      if (routingConfigReason?.Code === 'ConditionalCheckFailed') {
        if (
          routingConfigReason.Item === undefined ||
          routingConfigReason.Item.status.S ===
            ('DELETED' satisfies RoutingConfigStatus)
        ) {
          return failure(ErrorCase.NOT_FOUND, 'Routing Config not found');
        }

        if (
          routingConfigReason.Item.status.S ===
          ('COMPLETED' satisfies RoutingConfigStatus)
        ) {
          return failure(
            ErrorCase.ALREADY_SUBMITTED,
            'Routing Config with status COMPLETED cannot be updated'
          );
        }
      }

      if (
        templateReasons.some(
          (reason) => reason.Code === 'ConditionalCheckFailed'
        )
      ) {
        return failure(
          ErrorCase.VALIDATION_FAILED,
          'Unable to lock one or more templates referenced in Routing Config'
        );
      }
    }

    return failure(ErrorCase.INTERNAL, 'Failed to submit Routing Config', err);
  }

  private clientOwnerKey(clientId: string) {
    return `CLIENT#${clientId}`;
  }
}
