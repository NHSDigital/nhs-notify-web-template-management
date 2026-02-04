import { randomUUID } from 'node:crypto';
import {
  BatchGetCommand,
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
  $TemplateDto,
  CascadeItem,
  type CreateRoutingConfig,
  ErrorCase,
  type RoutingConfig,
  type RoutingConfigReference,
  RoutingConfigStatus,
  type TemplateDto,
  type UpdateRoutingConfig,
} from 'nhs-notify-backend-client';
import type { User } from 'nhs-notify-web-template-management-utils';
import { RoutingConfigQuery } from './query';
import {
  RoutingConfigUpdateBuilder,
  TemplateUpdateBuilder,
} from 'nhs-notify-entity-update-command-builder';
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

    if (status === 'DELETED') {
      return failure(ErrorCase.NOT_FOUND, 'Routing configuration not found');
    }

    if (status === 'COMPLETED') {
      return failure(
        ErrorCase.ALREADY_SUBMITTED,
        'Routing configuration with status COMPLETED cannot be updated'
      );
    }

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

    const templatesResult = await this.getTemplates(templateIds, user.clientId);

    if (templatesResult.error) {
      return templatesResult;
    }

    const templates = templatesResult.data;

    const missingTemplateIds = templateIds.filter(
      (tid) =>
        !templates.some((t) => t.id === tid && t.templateStatus !== 'DELETED')
    );

    if (missingTemplateIds.length > 0) {
      return failure(
        ErrorCase.ROUTING_CONFIG_TEMPLATES_NOT_FOUND,
        'Some templates not found',
        undefined,
        { templateIds: missingTemplateIds.join(',') }
      );
    }

    const invalidLetterTemplateIds = templates
      .filter(
        (t) =>
          t.templateType === 'LETTER' &&
          t.templateStatus !== 'PROOF_APPROVED' &&
          t.templateStatus !== 'SUBMITTED'
      )
      .map((t) => t.id);

    if (invalidLetterTemplateIds.length > 0) {
      return failure(
        ErrorCase.VALIDATION_FAILED,
        'Letter templates must have status PROOF_APPROVED or SUBMITTED',
        undefined,
        { templateIds: invalidLetterTemplateIds.join(',') }
      );
    }

    const routingConfigUpdate = new RoutingConfigUpdateBuilder(
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

    // add an update to each template to set status to SUBMITTED, or a condition check if already SUBMITTED
    const templateUpdatesAndChecks = templates.map((template) =>
      template.templateStatus === 'SUBMITTED'
        ? {
            ConditionCheck: {
              TableName: this.templateTableName,
              Key: {
                id: template.id,
                owner: this.clientOwnerKey(user.clientId),
              },
              ConditionExpression:
                'attribute_exists(id) AND lockNumber = :lockNumber AND templateStatus = :submitted',
              ExpressionAttributeValues: {
                ':lockNumber': template.lockNumber ?? 0,
                ':submitted': 'SUBMITTED',
              },
              ReturnValuesOnConditionCheckFailure:
                ReturnValuesOnConditionCheckFailure.ALL_OLD,
            },
          }
        : {
            Update: new TemplateUpdateBuilder(
              this.templateTableName,
              user.clientId,
              template.id,
              this.updateCmdOpts
            )
              .setStatus('SUBMITTED')
              .expectStatus(template.templateStatus)
              .expectLockNumber(template.lockNumber ?? 0)
              .incrementLockNumber()
              .setUpdatedByUserAt(this.internalUserKey(user))
              .build(),
          }
    );

    try {
      await this.client.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Update: routingConfigUpdate,
            },
            ...templateUpdatesAndChecks,
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

  private async getTemplates(
    templateIds: string[],
    clientId: string
  ): Promise<ApplicationResult<TemplateDto[]>> {
    // istanbul ignore next -- defensive check; $SubmittableCascade validation ensures at least one template
    if (templateIds.length === 0) {
      return success([]);
    }

    try {
      const result = await this.client.send(
        new BatchGetCommand({
          RequestItems: {
            [this.templateTableName]: {
              Keys: templateIds.map((tid) => ({
                id: tid,
                owner: this.clientOwnerKey(clientId),
              })),
            },
          },
        })
      );

      const rawTemplates = result.Responses?.[this.templateTableName] ?? [];

      const templates: TemplateDto[] = [];

      for (const item of rawTemplates) {
        const parsed = $TemplateDto.safeParse(item);

        if (!parsed.success) {
          return failure(
            ErrorCase.INTERNAL,
            'Error parsing template from database',
            parsed.error
          );
        }

        templates.push(parsed.data);
      }

      return success(templates);
    } catch (error) {
      return failure(ErrorCase.INTERNAL, 'Failed to retrieve templates', error);
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

    // Note: The first item will always be the routing config update
    // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CancellationReason.html
    const [routingConfigReason, ...templateReasons] =
      err.CancellationReasons ?? [];

    if (routingConfigReason && routingConfigReason.Code !== 'None') {
      return this.handleUpdateError(
        new ConditionalCheckFailedException({
          message: routingConfigReason.Message!,
          Item: routingConfigReason.Item,
          $metadata: err.$metadata,
        }),
        lockNumber
      );
    }

    // Find which template updates failed - likely due to lock number mismatch
    const failedTemplateIds: string[] = [];

    for (const [index, reason] of templateReasons.entries()) {
      if (reason.Code === 'ConditionalCheckFailed') {
        const templateId = templateIds[index];
        failedTemplateIds.push(templateId);
      }
    }

    if (failedTemplateIds.length > 0) {
      return failure(
        ErrorCase.CONFLICT,
        'Some templates have been modified since they were retrieved',
        err,
        { templateIds: failedTemplateIds.join(',') }
      );
    }

    return this.handleUpdateError(err, lockNumber);
  }
}
