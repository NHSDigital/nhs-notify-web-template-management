import { randomUUID } from 'node:crypto';
import {
  EmailProperties,
  ErrorCase,
  LetterFiles,
  NhsAppProperties,
  SmsProperties,
  TemplateStatus,
  CreateUpdateTemplate,
  ValidatedCreateUpdateTemplate,
  VirusScanStatus,
  UploadLetterProperties,
  ProofFileDetails,
} from 'nhs-notify-backend-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import type {
  FileType,
  TemplateKey,
  User,
} from 'nhs-notify-web-template-management-utils';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { ApplicationResult, failure, success, calculateTTL } from '../../utils';
import { DatabaseTemplate } from 'nhs-notify-web-template-management-utils';
import { TemplateUpdateBuilder } from 'nhs-notify-entity-update-command-builder';

export type WithAttachments<T> = T extends { templateType: 'LETTER' }
  ? T & { files: LetterFiles }
  : T;

const nhsAppAttributes: Record<keyof NhsAppProperties, null> = {
  templateType: null,
  message: null,
};

const emailAttributes: Record<keyof EmailProperties, null> = {
  templateType: null,
  message: null,
  subject: null,
};

const smsAttributes: Record<keyof SmsProperties, null> = {
  templateType: null,
  message: null,
};

const letterAttributes: Record<keyof UploadLetterProperties, null> = {
  files: null,
  language: null,
  letterType: null,
  templateType: null,
  campaignId: null,
};

export class TemplateRepository {
  private readonly clientOwnerPrefix = 'CLIENT#';

  constructor(
    private readonly client: DynamoDBDocumentClient,
    private readonly templatesTableName: string
  ) {}

  async get(
    templateId: string,
    clientId: string
  ): Promise<ApplicationResult<DatabaseTemplate>> {
    try {
      const response = await this.client.send(
        new GetCommand({
          TableName: this.templatesTableName,
          Key: { id: templateId, owner: this.clientOwnerKey(clientId) },
        })
      );

      if (!response?.Item) {
        return failure(ErrorCase.NOT_FOUND, 'Template not found');
      }

      const item = response.Item as DatabaseTemplate;

      if (item.templateStatus === 'DELETED') {
        return failure(ErrorCase.NOT_FOUND, 'Template not found');
      }

      return success(item);
    } catch (error) {
      return failure(ErrorCase.INTERNAL, 'Failed to get template', error);
    }
  }

  async create(
    template: WithAttachments<ValidatedCreateUpdateTemplate>,
    user: User,
    initialStatus: TemplateStatus = 'NOT_YET_SUBMITTED',
    campaignId?: string
  ): Promise<ApplicationResult<DatabaseTemplate>> {
    const date = new Date().toISOString();
    const entity: DatabaseTemplate = {
      ...template,
      id: randomUUID(),
      owner: this.clientOwnerKey(user.clientId),
      clientId: user.clientId,
      version: 1,
      templateStatus: initialStatus,
      createdAt: date,
      updatedAt: date,
      updatedBy: user.userId,
      createdBy: user.userId,
      ...(template.templateType === 'LETTER' && {
        campaignId,
      }),
    };

    try {
      await this.client.send(
        new PutCommand({
          TableName: this.templatesTableName,
          Item: entity,
          ConditionExpression: 'attribute_not_exists(id)',
        })
      );

      return success(entity);
    } catch (error) {
      return failure(ErrorCase.INTERNAL, 'Failed to create template', error);
    }
  }

  async update(
    templateId: string,
    template: ValidatedCreateUpdateTemplate,
    user: User,
    expectedStatus: TemplateStatus
  ): Promise<ApplicationResult<DatabaseTemplate>> {
    const updateExpression = [
      '#name = :name',
      ...this.getChannelAttributeExpressions(template),
    ];

    const expressionAttributeNames: Record<string, string> = {
      '#name': 'name',
      '#templateStatus': 'templateStatus',
      '#templateType': 'templateType',
      ...this.getChannelAttributeNames(template),
    };

    const expressionAttributeValues: Record<string, string | number> = {
      ':name': template.name,
      ':expectedStatus': expectedStatus,
      ':templateType': template.templateType,
      ...this.getChannelAttributeValues(template),
    };

    const conditions = [
      '#templateStatus = :expectedStatus AND #templateType = :templateType',
    ];

    try {
      const result = await this._update(
        templateId,
        user.clientId,
        user.userId,
        updateExpression,
        expressionAttributeNames,
        expressionAttributeValues,
        { $and: conditions }
      );

      return result;
    } catch (error) {
      if (
        error instanceof ConditionalCheckFailedException &&
        error.Item &&
        error.Item.templateType.S !== template.templateType
      ) {
        return failure(
          ErrorCase.CANNOT_CHANGE_TEMPLATE_TYPE,
          'Can not change template templateType',
          undefined,
          {
            templateType: `Expected ${error.Item.templateType.S} but got ${template.templateType}`,
          }
        );
      }

      return failure(ErrorCase.INTERNAL, 'Failed to update template', error);
    }
  }

  async delete(templateId: string, user: User) {
    const updateExpression = ['#templateStatus = :newStatus', '#ttl = :ttl'];

    const expressionAttributeNames: Record<string, string> = {
      '#ttl': 'ttl',
    };

    const expressionAttributeValues = {
      ':newStatus': 'DELETED' satisfies TemplateStatus,
      ':ttl': calculateTTL(),
    };

    try {
      const result = await this._update(
        templateId,
        user.clientId,
        user.userId,
        updateExpression,
        expressionAttributeNames,
        expressionAttributeValues,
        {}
      );

      return result;
    } catch (error) {
      return failure(ErrorCase.INTERNAL, 'Failed to update template', error);
    }
  }

  async submit(templateId: string, user: User) {
    const updateExpression = ['#templateStatus = :newStatus'];

    const expressionAttributeValues: Record<string, string> = {
      ':newStatus': 'SUBMITTED' satisfies TemplateStatus,
      ':expectedStatus': 'NOT_YET_SUBMITTED' satisfies TemplateStatus,
      ':expectedLetterStatus': 'PROOF_AVAILABLE' satisfies TemplateStatus,
      ':passed': 'PASSED' satisfies VirusScanStatus,
    };

    const conditions = [
      '(attribute_not_exists(files.pdfTemplate) OR files.pdfTemplate.virusScanStatus = :passed)',
      '(attribute_not_exists(files.testDataCsv) OR files.testDataCsv.virusScanStatus = :passed)',
      '#templateStatus = :expectedStatus OR #templateStatus = :expectedLetterStatus',
    ];

    try {
      const result = await this._update(
        templateId,
        user.clientId,
        user.userId,
        updateExpression,
        {},
        expressionAttributeValues,
        { $and: conditions }
      );

      return result;
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException && error.Item) {
        return failure(
          ErrorCase.CANNOT_SUBMIT,
          'Template cannot be submitted',
          error
        );
      }

      return failure(ErrorCase.INTERNAL, 'Failed to update template', error);
    }
  }

  async updateStatus(
    templateId: string,
    user: User,
    status: Exclude<TemplateStatus, 'SUBMITTED' | 'DELETED'>
  ): Promise<ApplicationResult<DatabaseTemplate>> {
    const updateExpression = ['#templateStatus = :newStatus'];

    const expressionAttributeValues: Record<string, string | number> = {
      ':newStatus': status,
    };

    try {
      const result = await this._update(
        templateId,
        user.clientId,
        user.userId,
        updateExpression,
        {},
        expressionAttributeValues,
        {}
      );
      return result;
    } catch (error) {
      return failure(ErrorCase.INTERNAL, 'Failed to update template', error);
    }
  }

  async list(clientId: string): Promise<ApplicationResult<DatabaseTemplate[]>> {
    try {
      const input: QueryCommandInput = {
        TableName: this.templatesTableName,
        KeyConditionExpression: '#owner = :owner',
        ExpressionAttributeNames: {
          '#owner': 'owner',
          '#status': 'templateStatus',
        },
        ExpressionAttributeValues: {
          ':owner': this.clientOwnerKey(clientId),
          ':deletedStatus': 'DELETED',
        },
        FilterExpression: '#status <> :deletedStatus',
      };

      const items: DatabaseTemplate[] = [];

      do {
        // eslint-disable-next-line no-await-in-loop
        const { Items = [], LastEvaluatedKey } = await this.client.send(
          new QueryCommand(input)
        );

        input.ExclusiveStartKey = LastEvaluatedKey;
        items.push(...(Items as DatabaseTemplate[]));
      } while (input.ExclusiveStartKey);
      return success(items);
    } catch (error) {
      return failure(ErrorCase.INTERNAL, 'Failed to list templates', error);
    }
  }

  async setLetterValidationResult(
    templateKey: TemplateKey,
    versionId: string,
    valid: boolean,
    personalisationParameters: string[],
    testDataCsvHeaders: string[],
    proofingEnabled: boolean
  ) {
    const ExpressionAttributeNames: UpdateCommandInput['ExpressionAttributeNames'] =
      {
        '#files': 'files',
        '#file': 'pdfTemplate' satisfies keyof LetterFiles,
        '#templateStatus': 'templateStatus',
        '#updatedAt': 'updatedAt',
        '#version': 'currentVersion',
      };

    const resolvedPostValidationSuccessStatus = proofingEnabled
      ? 'PENDING_PROOF_REQUEST'
      : 'NOT_YET_SUBMITTED';

    const ExpressionAttributeValues: UpdateCommandInput['ExpressionAttributeValues'] =
      {
        ':templateStatus': (valid
          ? resolvedPostValidationSuccessStatus
          : 'VALIDATION_FAILED') satisfies TemplateStatus,
        ':templateStatusDeleted': 'DELETED' satisfies TemplateStatus,
        ':templateStatusSubmitted': 'SUBMITTED' satisfies TemplateStatus,
        ':updatedAt': new Date().toISOString(),
        ':version': versionId,
      };

    const updates = [
      '#templateStatus = :templateStatus',
      '#updatedAt = :updatedAt',
    ];

    if (valid) {
      ExpressionAttributeNames['#personalisationParameters'] =
        'personalisationParameters';
      ExpressionAttributeNames['#testDataCsvHeaders'] = 'testDataCsvHeaders';

      ExpressionAttributeValues[':personalisationParameters'] =
        personalisationParameters;
      ExpressionAttributeValues[':testDataCsvHeaders'] = testDataCsvHeaders;

      updates.push(
        '#personalisationParameters = :personalisationParameters',
        '#testDataCsvHeaders = :testDataCsvHeaders'
      );
    }

    try {
      await this.client.send(
        new UpdateCommand({
          TableName: this.templatesTableName,
          Key: this.toDatabaseKey(templateKey),
          UpdateExpression: `SET ${updates.join(' , ')}`,
          ExpressionAttributeNames,
          ExpressionAttributeValues,
          ConditionExpression: `#files.#file.#version = :version and not #templateStatus in (:templateStatusDeleted, :templateStatusSubmitted)`,
        })
      );
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        logger
          .child({ templateKey })
          .error(
            'Conditional check failed when setting letter validation status:',
            error
          );
      } else {
        throw error;
      }
    }
  }

  private async appendFileToProofs(
    templateKey: TemplateKey,
    fileName: string,
    virusScanStatus: Extract<VirusScanStatus, 'PASSED' | 'FAILED'>,
    supplier: string
  ) {
    const dynamoResponse = await this.client.send(
      new UpdateCommand({
        TableName: this.templatesTableName,
        Key: this.toDatabaseKey(templateKey),
        UpdateExpression:
          'SET files.proofs.#fileName = :virusScanResult, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#fileName': fileName,
        },
        ExpressionAttributeValues: {
          ':templateStatusDeleted': 'DELETED' satisfies TemplateStatus,
          ':templateStatusSubmitted': 'SUBMITTED' satisfies TemplateStatus,
          ':updatedAt': new Date().toISOString(),
          ':virusScanResult': {
            fileName,
            virusScanStatus,
            supplier,
          } satisfies ProofFileDetails,
        },
        ConditionExpression:
          'attribute_not_exists(files.proofs.#fileName) and not templateStatus in (:templateStatusDeleted, :templateStatusSubmitted)',
        ReturnValues: 'ALL_NEW',
      })
    );

    return dynamoResponse.Attributes;
  }

  private async updateStatusToProofAvailable(templateKey: TemplateKey) {
    await this.client.send(
      new UpdateCommand({
        TableName: this.templatesTableName,
        Key: this.toDatabaseKey(templateKey),
        UpdateExpression:
          'SET templateStatus = :templateStatusProofAvailable, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':templateStatusWaitingForProof':
            'WAITING_FOR_PROOF' satisfies TemplateStatus,
          ':templateStatusProofAvailable':
            'PROOF_AVAILABLE' satisfies TemplateStatus,
          ':updatedAt': new Date().toISOString(),
        },
        ConditionExpression: 'templateStatus = :templateStatusWaitingForProof',
      })
    );
  }

  async setLetterFileVirusScanStatusForProof(
    templateKey: TemplateKey,
    fileName: string,
    virusScanStatus: Extract<VirusScanStatus, 'PASSED' | 'FAILED'>,
    supplier: string
  ) {
    try {
      const updatedItem = await this.appendFileToProofs(
        templateKey,
        fileName,
        virusScanStatus,
        supplier
      );

      // we do not want to try and update the status to PROOF_AVAILABLE if the scan has not passed or if the status has already been changed by another process
      if (
        virusScanStatus === 'FAILED' ||
        updatedItem?.templateStatus !== 'WAITING_FOR_PROOF'
      ) {
        return;
      }
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        logger
          .child({ templateKey })
          .error(
            'Conditional check failed when adding proof details to template',
            error
          );

        // the second update has a stronger condition than the first, so if this one fails no need to try the second
        return;
      }

      throw error;
    }

    try {
      await this.updateStatusToProofAvailable(templateKey);
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        logger
          .child({
            templateKey,
          })
          .error('Conditional check setting template status', error);
      } else {
        throw error;
      }
    }
  }

  async getClientId(id: string): Promise<string> {
    const dbResponse = await this.client.send(
      new QueryCommand({
        TableName: this.templatesTableName,
        IndexName: 'QueryById',
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
          ':id': id,
        },
      })
    );

    if (dbResponse.Items?.length !== 1) {
      throw new Error(`Could not identify item by id ${id}`);
    }

    const owner = dbResponse.Items[0].owner;

    if (!owner.startsWith(this.clientOwnerPrefix)) {
      throw new Error(`Unexpected owner format ${owner}`);
    }

    return owner.slice(this.clientOwnerPrefix.length);
  }

  async setLetterFileVirusScanStatusForUpload(
    templateKey: TemplateKey,
    fileType: FileType,
    versionId: string,
    status: Extract<VirusScanStatus, 'PASSED' | 'FAILED'>
  ) {
    const updates = [
      '#files.#file.#scanStatus = :scanStatus',
      '#updatedAt = :updatedAt',
    ];

    const ExpressionAttributeNames: UpdateCommandInput['ExpressionAttributeNames'] =
      {
        '#files': 'files',
        '#file': (fileType === 'pdf-template'
          ? 'pdfTemplate'
          : 'testDataCsv') satisfies Extract<
          keyof LetterFiles,
          'pdfTemplate' | 'testDataCsv'
        >,
        '#scanStatus': 'virusScanStatus',
        '#templateStatus': 'templateStatus',
        '#updatedAt': 'updatedAt',
        '#version': 'currentVersion',
      };

    const ExpressionAttributeValues: UpdateCommandInput['ExpressionAttributeValues'] =
      {
        ':scanStatus': status,
        ':templateStatusDeleted': 'DELETED' satisfies TemplateStatus,
        ':templateStatusSubmitted': 'SUBMITTED' satisfies TemplateStatus,
        ':version': versionId,
        ':updatedAt': new Date().toISOString(),
      };

    if (status === 'FAILED') {
      ExpressionAttributeValues[':templateStatusFailed'] =
        'VIRUS_SCAN_FAILED' satisfies TemplateStatus;
      updates.push('#templateStatus = :templateStatusFailed');
    }

    try {
      await this.client.send(
        new UpdateCommand({
          TableName: this.templatesTableName,
          Key: this.toDatabaseKey(templateKey),
          UpdateExpression: `SET ${updates.join(' , ')}`,
          ExpressionAttributeNames,
          ExpressionAttributeValues,
          ConditionExpression: `#files.#file.#version = :version and not #templateStatus in (:templateStatusDeleted, :templateStatusSubmitted)`,
        })
      );
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        logger
          .child({ templateKey })
          .error(
            'Conditional check failed when setting file virus scan status:',
            error
          );
      } else {
        throw error;
      }
    }
  }

  async proofRequestUpdate(templateId: string, user: User) {
    try {
      const update = new TemplateUpdateBuilder(
        this.templatesTableName,
        user.clientId,
        templateId,
        {
          ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
          ReturnValues: 'ALL_NEW',
        }
      )
        .setStatus('WAITING_FOR_PROOF')
        .expectedStatus('PENDING_PROOF_REQUEST')
        .setUpdatedByUserAt(user.userId)

        // dynamodb does not support conditional initialising of maps, so we have to
        // initialise an empty map here, then we set supplier-specific values in the
        // per-supplier sftp send lambda
        .initialiseSupplierReferences()
        .expectedTemplateType('LETTER')
        .expectedClientId(user.clientId)
        .expectProofingEnabled()
        .build();

      const response = await this.client.send(new UpdateCommand(update));
      return success(response.Attributes as DatabaseTemplate);
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        if (!error.Item || error.Item.templateStatus.S === 'DELETED') {
          return failure(ErrorCase.NOT_FOUND, `Template not found`);
        }

        return failure(
          ErrorCase.VALIDATION_FAILED,
          'Template cannot be proofed',
          error
        );
      }

      return failure(ErrorCase.INTERNAL, 'Failed to update template', error);
    }
  }

  private async _update(
    templateId: string,
    clientId: string,
    userId: string,
    updateExpression: string[],
    expressionAttributeNames: Record<string, string>,
    expressionAttributeValues: Record<string, string | number>,
    conditionExpression: { $and?: string[] }
  ) {
    const updatedAt = new Date().toISOString();

    const andConditions = [
      'attribute_exists(id)',
      'NOT #templateStatus IN (:deleted, :submitted)',
      ...(conditionExpression.$and || []),
    ].join(' AND ');

    const input: UpdateCommandInput = {
      TableName: this.templatesTableName,
      Key: {
        id: templateId,
        owner: this.clientOwnerKey(clientId),
      },
      UpdateExpression: `SET ${updateExpression.join(', ')}, #updatedAt = :updatedAt, #updatedBy = :updatedBy`,
      ExpressionAttributeNames: {
        ...expressionAttributeNames,
        '#updatedAt': 'updatedAt',
        '#updatedBy': 'updatedBy',
        '#templateStatus': 'templateStatus',
      },
      ExpressionAttributeValues: {
        ...expressionAttributeValues,
        ':updatedAt': updatedAt,
        ':updatedBy': userId,
        ':deleted': 'DELETED' satisfies TemplateStatus,
        ':submitted': 'SUBMITTED' satisfies TemplateStatus,
      },
      ConditionExpression: andConditions,
      ReturnValues: 'ALL_NEW',
      ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
    };

    try {
      const response = await this.client.send(new UpdateCommand(input));

      return success(response.Attributes as DatabaseTemplate);
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        if (!error.Item || error.Item.templateStatus.S === 'DELETED') {
          return failure(ErrorCase.NOT_FOUND, `Template not found`);
        }

        if (error.Item.templateStatus.S === 'SUBMITTED') {
          return failure(
            ErrorCase.ALREADY_SUBMITTED,
            `Template with status ${error.Item.templateStatus.S} cannot be updated`
          );
        }
      }
      throw error;
    }
  }

  private toDatabaseKey(templateKey: TemplateKey) {
    return {
      id: templateKey.templateId,
      owner: this.clientOwnerKey(templateKey.clientId),
    };
  }

  private clientOwnerKey(clientId: string) {
    return `CLIENT#${clientId}`;
  }

  private attributeExpressionsFromMap<T>(
    channelSpecificAttributes: Record<keyof T, null>
  ) {
    return Object.keys(channelSpecificAttributes).map(
      (att) => `#${att} = :${att}`
    );
  }

  private getChannelAttributeExpressions(template: CreateUpdateTemplate) {
    const expressions = [];
    if (template.templateType === 'NHS_APP') {
      expressions.push(
        ...this.attributeExpressionsFromMap<NhsAppProperties>(nhsAppAttributes)
      );
    }
    if (template.templateType === 'EMAIL') {
      expressions.push(
        ...this.attributeExpressionsFromMap<EmailProperties>(emailAttributes)
      );
    }
    if (template.templateType === 'SMS') {
      expressions.push(
        ...this.attributeExpressionsFromMap<SmsProperties>(smsAttributes)
      );
    }
    if (template.templateType === 'LETTER') {
      expressions.push(
        ...this.attributeExpressionsFromMap<UploadLetterProperties>(
          letterAttributes
        )
      );
    }
    return expressions;
  }

  private attributeNamesFromMap<T>(
    channelSpecificAttributes: Record<keyof T, null>
  ) {
    let attributeNames = {};

    for (const att in channelSpecificAttributes) {
      attributeNames = { ...attributeNames, [`#${att}`]: att };
    }

    return attributeNames;
  }

  private getChannelAttributeNames(template: CreateUpdateTemplate) {
    let names = {};

    if (template.templateType === 'NHS_APP') {
      names = this.attributeNamesFromMap<NhsAppProperties>(nhsAppAttributes);
    }
    if (template.templateType === 'EMAIL') {
      names = this.attributeNamesFromMap<EmailProperties>(emailAttributes);
    }
    if (template.templateType === 'SMS') {
      names = this.attributeNamesFromMap<SmsProperties>(smsAttributes);
    }
    if (template.templateType === 'LETTER') {
      names =
        this.attributeNamesFromMap<UploadLetterProperties>(letterAttributes);
    }

    return names;
  }

  private attributeValuesFromMapAndTemplate<T>(
    channelSpecificAttributes: Record<keyof T, null>,
    template: T
  ) {
    let attributeValues = {};

    for (const att in channelSpecificAttributes) {
      attributeValues = { ...attributeValues, [`:${att}`]: template[att] };
    }

    return attributeValues;
  }

  private getChannelAttributeValues(template: ValidatedCreateUpdateTemplate) {
    let values = {};

    if (template.templateType === 'NHS_APP') {
      values = this.attributeValuesFromMapAndTemplate<NhsAppProperties>(
        nhsAppAttributes,
        template
      );
    }
    if (template.templateType === 'EMAIL') {
      values = this.attributeValuesFromMapAndTemplate<EmailProperties>(
        emailAttributes,
        template
      );
    }
    if (template.templateType === 'SMS') {
      values = this.attributeValuesFromMapAndTemplate<SmsProperties>(
        smsAttributes,
        template
      );
    }
    if (template.templateType === 'LETTER') {
      values = this.attributeValuesFromMapAndTemplate<UploadLetterProperties>(
        letterAttributes,
        template
      );
    }

    return values;
  }
}
