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
  $SubmittableCascade,
  CascadeItem,
  type CreateRoutingConfig,
  ErrorCase,
  type RoutingConfig,
  type RoutingConfigReference,
  RoutingConfigStatus,
  type UpdateRoutingConfig,
} from 'nhs-notify-backend-client';
import type { User } from 'nhs-notify-web-template-management-utils';
import { RoutingConfigQuery } from './query';
import { RoutingConfigUpdateBuilder } from 'nhs-notify-entity-update-command-builder';
import {
  ConditionalCheckFailedException,
  ReturnValuesOnConditionCheckFailure,
  TransactionCanceledException,
} from '@aws-sdk/client-dynamodb';
import { calculateTTL } from '@backend-api/utils/calculate-ttl';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export class RoutingConfigRepository {
  private updateCmdOpts = {
    ReturnValues: 'ALL_NEW',
    ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
  } as const;

  constructor(
    private readonly client: DynamoDBDocumentClient,
    private readonly tableName: string,
    private readonly templateTableName: string
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

    const templateIds = this.extractTemplateIds(updateData.cascade);

    try {
      await this.client.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Update: update.build(),
            },
            ...templateIds.map((templateId) => ({
              ConditionCheck: {
                TableName: this.templateTableName,
                Key: {
                  id: templateId,
                  owner: this.clientOwnerKey(user.clientId),
                },
                ConditionExpression: 'attribute_exists(id)',
              },
            })),
          ],
        })
      );

      const getResult = await this.client.send(
        new GetCommand({
          TableName: this.tableName,
          Key: { id, owner: this.clientOwnerKey(user.clientId) },
        })
      );

      const parsed = $RoutingConfig.safeParse(getResult.Item);

      if (!parsed.success) {
        return failure(
          ErrorCase.INTERNAL,
          'Error parsing updated Routing Config',
          parsed.error
        );
      }

      return success(parsed.data);
    } catch (error) {
      return this.handleUpdateTransactionError(error, lockNumber, templateIds);
    }
  }

  async submit(
    id: string,
    user: User,
    lockNumber: number
  ): Promise<ApplicationResult<RoutingConfig>> {
    const existingConfig = await this.get(id, user.clientId);

    if (existingConfig.error) {
      return existingConfig;
    }

    const {
      status,
      cascade,
      lockNumber: currentLockNumber,
    } = existingConfig.data;

    // Check status before cascade validation
    if (status === 'DELETED') {
      return failure(ErrorCase.NOT_FOUND, 'Routing configuration not found');
    }

    if (status === 'COMPLETED') {
      return failure(
        ErrorCase.ALREADY_SUBMITTED,
        'Routing configuration with status COMPLETED cannot be updated'
      );
    }

    // Check lock number before cascade validation
    if (currentLockNumber !== lockNumber) {
      return failure(
        ErrorCase.CONFLICT,
        'Lock number mismatch - Routing configuration has been modified since last read'
      );
    }

    const submittableCascadeValidation = $SubmittableCascade.safeParse(cascade);

    if (!submittableCascadeValidation.success) {
      return failure(
        ErrorCase.VALIDATION_FAILED,
        'Routing config is not ready for submission: all cascade items must have templates assigned',
        submittableCascadeValidation.error
      );
    }

    const templateIds = this.extractTemplateIds(cascade);

    const update = new RoutingConfigUpdateBuilder(
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
      await this.client.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Update: update,
            },
            // Template existence & ownership check + For LETTER templates, check they have PROOF_APPROVED or SUBMITTED status
            // Also exclude DELETED templates for all template types
            ...templateIds.map((templateId) => ({
              ConditionCheck: {
                TableName: this.templateTableName,
                Key: {
                  id: templateId,
                  owner: this.clientOwnerKey(user.clientId),
                },
                ConditionExpression:
                  'attribute_exists(id) AND templateStatus <> :deleted AND (templateType <> :letterType OR templateStatus IN (:proofApproved, :submitted))',
                ExpressionAttributeValues: {
                  ':deleted': 'DELETED',
                  ':letterType': 'LETTER',
                  ':proofApproved': 'PROOF_APPROVED',
                  ':submitted': 'SUBMITTED',
                },
                ReturnValuesOnConditionCheckFailure:
                  ReturnValuesOnConditionCheckFailure.ALL_OLD,
              },
            })),
          ],
        })
      );

      const getResult = await this.client.send(
        new GetCommand({
          TableName: this.tableName,
          Key: { id, owner: this.clientOwnerKey(user.clientId) },
        })
      );

      const parsed = $RoutingConfig.safeParse(getResult.Item);

      if (!parsed.success) {
        return failure(
          ErrorCase.INTERNAL,
          'Error parsing submitted Routing Config',
          parsed.error
        );
      }

      return success(parsed.data);
    } catch (error) {
      return this.handleSubmitTransactionError(error, lockNumber, templateIds);
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
        return failure(ErrorCase.NOT_FOUND, 'Routing configuration not found');
      }

      const parsed = $RoutingConfig.parse(result.Item);

      return success(parsed);
    } catch (error) {
      return failure(
        ErrorCase.INTERNAL,
        'Error retrieving routing configuration',
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
          'Lock number mismatch - Routing configuration has been modified since last read',
          err
        );
      }
    }

    return failure(ErrorCase.INTERNAL, 'Failed to update routing config', err);
  }

  async getByTemplateId(
    templateId: string,
    clientId: string
  ): Promise<ApplicationResult<RoutingConfigReference[]>> {
    const query = this.query(clientId).excludeStatus('DELETED');

    const routingConfigsResult = await query.list();

    if (routingConfigsResult.error) {
      return routingConfigsResult;
    }

    const routingConfigs = routingConfigsResult.data;
    const linkedRoutingConfigs = routingConfigs
      .filter((routingConfig) =>
        this.doesRoutingConfigReferenceTemplateId(routingConfig, templateId)
      )
      .map(({ id, name }) => ({
        id,
        name,
      }));

    return success(linkedRoutingConfigs);
  }

  private doesRoutingConfigReferenceTemplateId(
    routingConfig: RoutingConfig,
    templateId: string
  ): boolean {
    return routingConfig.cascade.some(
      (cascadeItem) =>
        cascadeItem.defaultTemplateId === templateId ||
        cascadeItem.conditionalTemplates?.some(
          (conditionalTemplate) => conditionalTemplate.templateId === templateId
        )
    );
  }

  private handleUpdateTransactionError(
    err: unknown,
    lockNumber: number,
    templateIds: string[]
  ): ApplicationResult<RoutingConfig> {
    if (!(err instanceof TransactionCanceledException)) {
      return this.handleUpdateError(err, lockNumber);
    }

    // Note: The first item will always be the update
    // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CancellationReason.html
    const [updateReason, ...templateReasons] = err.CancellationReasons ?? [];

    if (updateReason && updateReason.Code !== 'None') {
      return this.handleUpdateError(
        new ConditionalCheckFailedException({
          message: updateReason.Message!,
          Item: updateReason.Item,
          $metadata: err.$metadata,
        }),
        lockNumber
      );
    }

    const templatesMissing = templateReasons.some(
      (r) => r.Code === 'ConditionalCheckFailed'
    );

    if (templatesMissing) {
      return failure(
        ErrorCase.ROUTING_CONFIG_TEMPLATES_NOT_FOUND,
        'Some templates not found',
        err,
        { templateIds: templateIds.join(',') }
      );
    }

    return this.handleUpdateError(err, lockNumber);
  }

  private clientOwnerKey(clientId: string) {
    return `CLIENT#${clientId}`;
  }

  private internalUserKey(user: User) {
    return `INTERNAL_USER#${user.internalUserId}`;
  }

  private extractTemplateIds(items: CascadeItem[] = []) {
    return items
      .flatMap((r) => [
        r.defaultTemplateId,
        ...(r.conditionalTemplates?.map((a) => a.templateId) ?? []),
      ])
      .filter((id): id is string => id != null);
  }

  private handleSubmitTransactionError(
    err: unknown,
    lockNumber: number,
    templateIds: string[]
  ): ApplicationResult<RoutingConfig> {
    if (!(err instanceof TransactionCanceledException)) {
      return this.handleUpdateError(err, lockNumber);
    }

    // Note: The first item will always be the update
    // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CancellationReason.html
    const [updateReason, ...templateReasons] = err.CancellationReasons ?? [];

    if (updateReason && updateReason.Code !== 'None') {
      return this.handleUpdateError(
        new ConditionalCheckFailedException({
          message: updateReason.Message!,
          Item: updateReason.Item,
          $metadata: err.$metadata,
        }),
        lockNumber
      );
    }

    // Find which templates failed the condition check
    const missingTemplateIds: string[] = [];
    const invalidLetterTemplateIds: string[] = [];

    for (const [index, reason] of templateReasons.entries()) {
      if (reason.Code === 'ConditionalCheckFailed') {
        const templateId = templateIds[index];

        if (
          !reason.Item ||
          reason.Item.templateStatus?.S ===
            ('DELETED' satisfies RoutingConfigStatus)
        ) {
          missingTemplateIds.push(templateId);
        } else {
          invalidLetterTemplateIds.push(templateId);
        }
      }
    }

    if (missingTemplateIds.length > 0) {
      return failure(
        ErrorCase.ROUTING_CONFIG_TEMPLATES_NOT_FOUND,
        'Some templates not found',
        err,
        { templateIds: missingTemplateIds.join(',') }
      );
    }

    if (invalidLetterTemplateIds.length > 0) {
      return failure(
        ErrorCase.VALIDATION_FAILED,
        'Letter templates must have status PROOF_APPROVED or SUBMITTED',
        err,
        { templateIds: invalidLetterTemplateIds.join(',') }
      );
    }

    return this.handleUpdateError(err, lockNumber);
  }
}
