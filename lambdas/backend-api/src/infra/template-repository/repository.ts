import { randomUUID } from 'node:crypto';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { ErrorCase, FailureResult } from 'nhs-notify-backend-client';
import type {
  CreateUpdateTemplate,
  AuthoringLetterPatch,
  PdfLetterFiles,
  ProofFileDetails,
  TemplateDto,
  TemplateStatus,
  VirusScanStatus,
  TemplateType,
  LetterVersion,
} from 'nhs-notify-web-template-management-types';
import { TemplateUpdateBuilder } from 'nhs-notify-entity-update-command-builder';
import type {
  DatabaseTemplate,
  FileType,
  LetterFileKey,
  TemplateKey,
  User,
} from 'nhs-notify-web-template-management-utils';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { calculateTTL } from '@backend-api/utils/calculate-ttl';
import { ApplicationResult, failure, success } from '../../utils';
import { TemplateQuery } from './query';

export type WithAttachments<T> = T extends {
  templateType: 'LETTER';
  letterVersion: 'PDF';
}
  ? T & { files: PdfLetterFiles }
  : T;

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
    template: WithAttachments<CreateUpdateTemplate>,
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
      updatedBy: this.internalUserKey(user),
      createdBy: this.internalUserKey(user),
      ...(template.templateType === 'LETTER' && {
        campaignId,
      }),
      lockNumber: 0,
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
    template: Exclude<CreateUpdateTemplate, { templateType: 'LETTER' }>,
    user: User,
    expectedStatus: TemplateStatus,
    lockNumber: number
  ): Promise<ApplicationResult<DatabaseTemplate>> {
    const update = new TemplateUpdateBuilder(
      this.templatesTableName,
      user.clientId,
      templateId,
      {
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        ReturnValues: 'ALL_NEW',
      }
    );

    update
      .setName(template.name)
      .setMessage(template.message)
      .expectTemplateExists()
      .expectStatus(expectedStatus)
      .expectNotFinalStatus()
      .expectTemplateType(template.templateType)
      .expectLockNumber(lockNumber)
      .setUpdatedByUserAt(this.internalUserKey(user))
      .incrementLockNumber();

    if (template.templateType === 'EMAIL') {
      update.setSubject(template.subject);
    }

    try {
      const response = await this.client.send(
        new UpdateCommand(update.build())
      );

      return success(response.Attributes as DatabaseTemplate);
    } catch (error) {
      return this._handleUpdateError(error, template, lockNumber);
    }
  }

  async patch(
    templateId: string,
    updates: AuthoringLetterPatch,
    user: User,
    lockNumber: number
  ): Promise<ApplicationResult<DatabaseTemplate>> {
    const update = new TemplateUpdateBuilder(
      this.templatesTableName,
      user.clientId,
      templateId,
      {
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        ReturnValues: 'ALL_NEW',
      }
    );

    if (updates.name) {
      update.setName(updates.name);
    }

    if (updates.campaignId) {
      update.setCampaignId(updates.campaignId);
    }

    if (updates.letterVariantId) {
      update.setLetterVariantId(updates.letterVariantId);
    } else if (updates.letterVariantId === '') {
      update.removeLetterVariantId();
    }

    const bannedNonFinalStatuses: TemplateStatus[] = ['PROOF_APPROVED'];

    update
      .expectTemplateExists()
      .expectTemplateType('LETTER')
      .expectLetterVersion('AUTHORING')
      .expectNotFinalStatus()
      .expectNotStatus(bannedNonFinalStatuses)
      .expectLockNumber(lockNumber)
      .setUpdatedByUserAt(this.internalUserKey(user))
      .incrementLockNumber();

    try {
      const response = await this.client.send(
        new UpdateCommand(update.build())
      );

      return success(response.Attributes as DatabaseTemplate);
    } catch (error) {
      return this._handleUpdateError(
        error,
        updates,
        lockNumber,
        bannedNonFinalStatuses,
        (oldItem) => {
          if (
            oldItem.templateType !== ('LETTER' as TemplateType) ||
            oldItem.letterVersion !== ('AUTHORING' as LetterVersion)
          ) {
            return failure(
              ErrorCase.FEATURE_DISABLED,
              'Unsupported for this template type'
            );
          }
        }
      );
    }
  }

  async delete(
    templateId: string,
    user: User,
    lockNumber: number
  ): Promise<ApplicationResult<null>> {
    const update = new TemplateUpdateBuilder(
      this.templatesTableName,
      user.clientId,
      templateId,
      {
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        ReturnValues: 'ALL_NEW',
      }
    );

    update
      .setStatus('DELETED')
      .setTTL(calculateTTL())
      .expectTemplateExists()
      .expectNotFinalStatus()
      .expectLockNumber(lockNumber)
      .setUpdatedByUserAt(this.internalUserKey(user))
      .incrementLockNumber();

    try {
      await this.client.send(new UpdateCommand(update.build()));

      return success(null);
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        if (!error.Item || error.Item.templateStatus.S === 'DELETED') {
          return failure(ErrorCase.NOT_FOUND, `Template not found`, error);
        }

        const oldItem = unmarshall(error.Item);

        if (oldItem.templateStatus === 'SUBMITTED') {
          return failure(
            ErrorCase.ALREADY_SUBMITTED,
            `Template with status ${oldItem.templateStatus} cannot be updated`,
            error
          );
        }

        if (oldItem.lockNumber !== lockNumber) {
          return failure(
            ErrorCase.CONFLICT,
            'Lock number mismatch - Template has been modified since last read',
            error
          );
        }
      }

      return failure(ErrorCase.INTERNAL, 'Failed to delete template', error);
    }
  }

  async submit(templateId: string, user: User, lockNumber: number) {
    const updateExpression = ['#templateStatus = :newStatus'];

    const expressionAttributeValues: UpdateCommandInput['ExpressionAttributeValues'] =
      {
        ':newStatus': 'SUBMITTED' satisfies TemplateStatus,
        ':expectedStatus': 'NOT_YET_SUBMITTED' satisfies TemplateStatus,
        ':expectedProofingLetterStatus':
          'PROOF_AVAILABLE' satisfies TemplateStatus,
        ':passed': 'PASSED' satisfies VirusScanStatus,
        ':expectedLockNumber': lockNumber,
      };

    const conditions = [
      '(attribute_not_exists(files.pdfTemplate) OR files.pdfTemplate.virusScanStatus = :passed)',
      '(attribute_not_exists(files.testDataCsv) OR files.testDataCsv.virusScanStatus = :passed)',
      '(#templateStatus = :expectedStatus OR #templateStatus = :expectedProofingLetterStatus)',
      '(attribute_not_exists(#lockNumber) OR #lockNumber = :expectedLockNumber)',
    ];

    try {
      const result = await this._update(
        templateId,
        user,
        updateExpression,
        {},
        expressionAttributeValues,
        { $and: conditions }
      );

      return result;
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException && error.Item) {
        const oldItem = unmarshall(error.Item);

        if (oldItem.lockNumber !== lockNumber) {
          return failure(
            ErrorCase.CONFLICT,
            'Lock number mismatch - Template has been modified since last read',
            error
          );
        }

        return failure(
          ErrorCase.CANNOT_SUBMIT,
          'Template cannot be submitted',
          error
        );
      }

      return failure(ErrorCase.INTERNAL, 'Failed to update template', error);
    }
  }

  async approveProof(templateId: string, user: User, lockNumber: number) {
    const updateExpression = ['#templateStatus = :newStatus'];

    const expressionAttributeValues: UpdateCommandInput['ExpressionAttributeValues'] =
      {
        ':newStatus': 'PROOF_APPROVED' satisfies TemplateStatus,
        ':expectedProofingLetterStatus':
          'PROOF_AVAILABLE' satisfies TemplateStatus,
        ':passed': 'PASSED' satisfies VirusScanStatus,
        ':expectedLockNumber': lockNumber,
      };

    const conditions = [
      '(attribute_not_exists(files.pdfTemplate) OR files.pdfTemplate.virusScanStatus = :passed)',
      '(attribute_not_exists(files.testDataCsv) OR files.testDataCsv.virusScanStatus = :passed)',
      '#templateStatus = :expectedProofingLetterStatus',
      '(attribute_not_exists(#lockNumber) OR #lockNumber = :expectedLockNumber)',
    ];

    try {
      const result = await this._update(
        templateId,
        user,
        updateExpression,
        {},
        expressionAttributeValues,
        { $and: conditions }
      );

      return result;
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException && error.Item) {
        const oldItem = unmarshall(error.Item);

        if (oldItem.lockNumber !== lockNumber) {
          return failure(
            ErrorCase.CONFLICT,
            'Lock number mismatch - Template has been modified since last read',
            error
          );
        }

        return failure(
          ErrorCase.CANNOT_APPROVE,
          'Proof cannot be approved',
          error
        );
      }

      return failure(ErrorCase.INTERNAL, 'Failed to update template', error);
    }
  }

  async finaliseLetterUpload(
    templateId: string,
    user: User
  ): Promise<ApplicationResult<DatabaseTemplate>> {
    const updateExpression = ['#templateStatus = :newStatus'];

    const expressionAttributeValues: Record<string, string | number> = {
      ':newStatus': 'PENDING_VALIDATION',
    };

    try {
      const result = await this._update(
        templateId,
        user,
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

  query(clientId: string): TemplateQuery {
    return new TemplateQuery(
      this.client,
      this.templatesTableName,
      this.clientOwnerKey(clientId)
    );
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
        '#file': 'pdfTemplate' satisfies keyof PdfLetterFiles,
        '#templateStatus': 'templateStatus',
        '#updatedAt': 'updatedAt',
        '#version': 'currentVersion',
        '#lockNumber': 'lockNumber',
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
        ':lockNumberIncrement': 1,
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
          UpdateExpression: `SET ${updates.join(' , ')} ADD #lockNumber :lockNumberIncrement`,
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
          'SET files.proofs.#fileName = :virusScanResult, updatedAt = :updatedAt ADD #lockNumber :lockNumberIncrement',
        ExpressionAttributeNames: {
          '#fileName': fileName,
          '#lockNumber': 'lockNumber',
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
          ':lockNumberIncrement': 1,
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
          'SET templateStatus = :templateStatusProofAvailable, updatedAt = :updatedAt ADD #lockNumber :lockNumberIncrement',
        ExpressionAttributeNames: {
          '#lockNumber': 'lockNumber',
        },
        ExpressionAttributeValues: {
          ':templateStatusWaitingForProof':
            'WAITING_FOR_PROOF' satisfies TemplateStatus,
          ':templateStatusProofAvailable':
            'PROOF_AVAILABLE' satisfies TemplateStatus,
          ':updatedAt': new Date().toISOString(),
          ':lockNumberIncrement': 1,
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
    fileType: Exclude<FileType, 'proofs'>,
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
        '#file': this.templateFileKey(fileType),
        '#scanStatus': 'virusScanStatus',
        '#templateStatus': 'templateStatus',
        '#updatedAt': 'updatedAt',
        '#version': 'currentVersion',
        '#lockNumber': 'lockNumber',
      };

    const ExpressionAttributeValues: UpdateCommandInput['ExpressionAttributeValues'] =
      {
        ':scanStatus': status,
        ':templateStatusDeleted': 'DELETED' satisfies TemplateStatus,
        ':templateStatusSubmitted': 'SUBMITTED' satisfies TemplateStatus,
        ':version': versionId,
        ':updatedAt': new Date().toISOString(),
        ':lockNumberIncrement': 1,
      };

    if (status === 'FAILED') {
      const templateStatus: TemplateStatus =
        fileType === 'docx-template'
          ? 'VALIDATION_FAILED'
          : 'VIRUS_SCAN_FAILED';
      ExpressionAttributeValues[':templateStatusFailed'] = templateStatus;
      updates.push('#templateStatus = :templateStatusFailed');

      if (fileType === 'docx-template') {
        ExpressionAttributeNames['#validationErrors'] = 'validationErrors';
        ExpressionAttributeValues[':validationErrors'] = ['VIRUS_SCAN_FAILED'];
        ExpressionAttributeValues[':emptyList'] = [];
        updates.push(
          '#validationErrors = list_append(if_not_exists(#validationErrors, :emptyList), :validationErrors)'
        );
      }
    }

    try {
      await this.client.send(
        new UpdateCommand({
          TableName: this.templatesTableName,
          Key: this.toDatabaseKey(templateKey),
          UpdateExpression: `SET ${updates.join(' , ')} ADD #lockNumber :lockNumberIncrement`,
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

  async proofRequestUpdate(templateId: string, user: User, lockNumber: number) {
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
        .expectStatus('PENDING_PROOF_REQUEST')
        .setUpdatedByUserAt(this.internalUserKey(user))

        // dynamodb does not support conditional initialising of maps, so we have to
        // initialise an empty map here, then we set supplier-specific values in the
        // per-supplier sftp send lambda
        .initialiseSupplierReferences()
        .expectTemplateType('LETTER')
        .expectClientId(user.clientId)
        .expectProofingEnabled()
        .expectLockNumber(lockNumber)
        .incrementLockNumber()
        .build();

      const response = await this.client.send(new UpdateCommand(update));
      return success(response.Attributes as DatabaseTemplate);
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        if (!error.Item || error.Item.templateStatus.S === 'DELETED') {
          return failure(ErrorCase.NOT_FOUND, `Template not found`);
        }

        const oldItem = unmarshall(error.Item);

        if (oldItem.lockNumber !== lockNumber) {
          return failure(
            ErrorCase.CONFLICT,
            'Lock number mismatch - Template has been modified since last read',
            error
          );
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
    user: User,
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
        owner: this.clientOwnerKey(user.clientId),
      },
      UpdateExpression: `SET ${updateExpression.join(', ')}, #updatedAt = :updatedAt, #updatedBy = :updatedBy ADD #lockNumber :lockNumberIncrement`,
      ExpressionAttributeNames: {
        ...expressionAttributeNames,
        '#updatedAt': 'updatedAt',
        '#updatedBy': 'updatedBy',
        '#templateStatus': 'templateStatus',
        '#lockNumber': 'lockNumber',
      },
      ExpressionAttributeValues: {
        ...expressionAttributeValues,
        ':updatedAt': updatedAt,
        ':updatedBy': this.internalUserKey(user),
        ':deleted': 'DELETED' satisfies TemplateStatus,
        ':submitted': 'SUBMITTED' satisfies TemplateStatus,
        ':lockNumberIncrement': 1,
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

  private internalUserKey(user: User) {
    return `INTERNAL_USER#${user.internalUserId}`;
  }

  private templateFileKey(fileType: FileType): LetterFileKey {
    const mapping: Record<FileType, LetterFileKey> = {
      'docx-template': 'docxTemplate',
      'pdf-template': 'pdfTemplate',
      'test-data': 'testDataCsv',
      proofs: 'proofs',
    };

    return mapping[fileType];
  }

  private _handleUpdateError(
    error: unknown,
    updates: Partial<TemplateDto>,
    lockNumber: number,
    blockedStatuses: TemplateStatus[] = [],
    callback?: (oldItem: Record<string, unknown>) => FailureResult | void
  ) {
    if (error instanceof ConditionalCheckFailedException) {
      if (!error.Item || error.Item.templateStatus.S === 'DELETED') {
        return failure(ErrorCase.NOT_FOUND, `Template not found`, error);
      }

      const oldItem = unmarshall(error.Item);

      if (['SUBMITTED', ...blockedStatuses].includes(oldItem.templateStatus)) {
        return failure(
          ErrorCase.ALREADY_SUBMITTED,
          `Template with status ${oldItem.templateStatus} cannot be updated`,
          error
        );
      }

      if (
        updates.templateType &&
        oldItem.templateType !== updates.templateType
      ) {
        return failure(
          ErrorCase.CANNOT_CHANGE_TEMPLATE_TYPE,
          'Can not change template templateType',
          error,
          {
            templateType: `Expected ${oldItem.templateType} but got ${updates.templateType}`,
          }
        );
      }

      if (oldItem.lockNumber !== lockNumber) {
        return failure(
          ErrorCase.CONFLICT,
          'Lock number mismatch - Template has been modified since last read',
          error
        );
      }

      if (callback) {
        const callbackFailure = callback(oldItem);

        if (callbackFailure) {
          callbackFailure.error.actualError = error;
          return callbackFailure;
        }
      }
    }
    return failure(ErrorCase.INTERNAL, 'Failed to update template', error);
  }
}
