import 'aws-sdk-client-mock-jest';
import { randomUUID } from 'node:crypto';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { TemplateRepository } from '../../../infra';
import { marshall } from '@aws-sdk/util-dynamodb';
import {
  CreateUpdateEmailTemplate,
  CreateUpdateNHSAppTemplate,
  CreateUpdateSMSTemplate,
  DatabaseTemplate,
} from 'nhs-notify-web-template-management-utils';
import { calculateTTL } from '@backend-api/utils/calculate-ttl';
import {
  makeAppTemplate,
  makeEmailTemplate,
  makeLetterTemplate,
  makeSmsTemplate,
} from '@backend-api/__tests__/fixtures/template';

jest.mock('nhs-notify-web-template-management-utils/logger');
jest.mock('node:crypto');
jest.mock('@backend-api/utils/calculate-ttl');

const templateId = 'abc-def-ghi-jkl-123';
const templatesTableName = 'templates';

const appTemplates = makeAppTemplate();
const emailTemplates = makeEmailTemplate();
const smsTemplates = makeSmsTemplate();
const letterTemplates = makeLetterTemplate();

const setup = () => {
  const ddbDocClient = mockClient(DynamoDBDocumentClient);

  const templateRepository = new TemplateRepository(
    ddbDocClient as unknown as DynamoDBDocumentClient,
    templatesTableName
  );

  return { templateRepository, mocks: { ddbDocClient } };
};

const internalUserId = 'user-id';
const clientId = 'client-id';
const ownerWithClientPrefix = `CLIENT#${clientId}`;
const user = { internalUserId, clientId };

describe('templateRepository', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2024, 11, 27));
  });

  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(randomUUID).mockReturnValue(templateId);
    jest.mocked(calculateTTL).mockReturnValue(1000);
    jest.mocked(logger).child.mockReturnThis();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('get', () => {
    test.each([
      { id: templateId, owner: 'fake-owner' },
      { id: 'fake-id', owner: ownerWithClientPrefix },
    ])(
      'should return not found error when, templateId and/or owner does not match database record',
      async ({ id, owner }) => {
        const { templateRepository, mocks } = setup();

        mocks.ddbDocClient
          .on(GetCommand, {
            TableName: templatesTableName,
            Key: { id: templateId, owner },
          })
          .resolves({
            Item: { id: 'abc-def-ghi-jkl-123', owner },
          });

        const response = await templateRepository.get(id, clientId);

        expect(response).toEqual({
          error: {
            errorMeta: {
              description: 'Template not found',
              code: 404,
            },
          },
        });
      }
    );

    test('should return not found error when template status is DELETED', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient.on(GetCommand).resolves({
        Item: {
          id: templateId,
          owner: ownerWithClientPrefix,
          templateStatus: 'DELETED',
        },
      });

      const response = await templateRepository.get(templateId, clientId);

      expect(response).toEqual({
        error: {
          errorMeta: {
            description: 'Template not found',
            code: 404,
          },
        },
      });
    });

    test('should error when unexpected error occurs', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient
        .on(GetCommand)
        .rejects(new Error('InternalServerError'));

      const response = await templateRepository.get(templateId, clientId);

      expect(response).toEqual({
        error: {
          errorMeta: {
            description: 'Failed to get template',
            code: 500,
          },
          actualError: new Error('InternalServerError'),
        },
      });
    });

    test('should return template', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient
        .on(GetCommand, {
          TableName: templatesTableName,
          Key: { id: templateId, owner: ownerWithClientPrefix },
        })
        .resolves({ Item: emailTemplates.databaseTemplate });

      const response = await templateRepository.get(templateId, clientId);

      expect(response).toEqual({ data: emailTemplates.databaseTemplate });
    });
  });

  describe('create', () => {
    test('should return error when, unexpected error occurs', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient
        .on(PutCommand)
        .rejects(new Error('InternalServerError'));

      const response = await templateRepository.create(
        {
          templateType: 'EMAIL',
          name: 'name',
          message: 'message',
          subject: 'pickles',
        },
        user
      );

      expect(response).toEqual({
        error: {
          actualError: new Error('InternalServerError'),
          errorMeta: {
            code: 500,
            description: 'Failed to create template',
          },
        },
      });
    });

    test.each([emailTemplates, smsTemplates, appTemplates, letterTemplates])(
      'should create template of type $templateType',
      async ({ createUpdateTemplate, databaseTemplate }) => {
        const { templateRepository, mocks } = setup();

        mocks.ddbDocClient
          .on(PutCommand, {
            TableName: templatesTableName,
            Item: databaseTemplate,
          })
          .resolves({});

        const response = await templateRepository.create(
          createUpdateTemplate,
          user,
          'NOT_YET_SUBMITTED',
          'campaign-id'
        );

        expect(response).toEqual({
          data: databaseTemplate,
        });

        expect(mocks.ddbDocClient).toHaveReceivedCommandWith(PutCommand, {
          ConditionExpression: 'attribute_not_exists(id)',
          Item: databaseTemplate,
          TableName: templatesTableName,
        });
      }
    );
  });

  describe('update', () => {
    test('should correctly update email template and return updated value', async () => {
      const { templateRepository, mocks } = setup();

      const requestedUpdate: CreateUpdateEmailTemplate = {
        ...emailTemplates.createUpdateTemplate,
        name: 'updated-name',
      };

      const updated: DatabaseTemplate = {
        ...emailTemplates.databaseTemplate,
        ...requestedUpdate,
        lockNumber: 2,
      };

      mocks.ddbDocClient
        .on(UpdateCommand, {
          TableName: templatesTableName,
          Key: { id: 'abc-def-ghi-jkl-123', owner: ownerWithClientPrefix },
        })
        .resolves({
          Attributes: updated,
        });

      const response = await templateRepository.update(
        'abc-def-ghi-jkl-123',
        requestedUpdate,
        user,
        'NOT_YET_SUBMITTED',
        1
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'templates',
        Key: { id: 'abc-def-ghi-jkl-123', owner: 'CLIENT#client-id' },
        ReturnValues: 'ALL_NEW',
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        ExpressionAttributeNames: {
          '#id': 'id',
          '#lockNumber': 'lockNumber',
          '#message': 'message',
          '#name': 'name',
          '#subject': 'subject',
          '#templateStatus': 'templateStatus',
          '#templateType': 'templateType',
          '#updatedAt': 'updatedAt',
          '#updatedBy': 'updatedBy',
        },
        ExpressionAttributeValues: {
          ':condition_2_templateStatus': 'NOT_YET_SUBMITTED',
          ':condition_3_1_templateStatus': 'DELETED',
          ':condition_3_2_templateStatus': 'SUBMITTED',
          ':condition_4_templateType': 'EMAIL',
          ':condition_5_1_lockNumber': 1,
          ':lockNumber': 1,
          ':message': 'message',
          ':name': 'updated-name',
          ':subject': 'pickles',
          ':updatedAt': '2024-12-27T00:00:00.000Z',
          ':updatedBy': `INTERNAL_USER#${internalUserId}`,
        },
        UpdateExpression:
          'SET #name = :name, #message = :message, #updatedAt = :updatedAt, #updatedBy = :updatedBy, #subject = :subject ADD #lockNumber :lockNumber',
        ConditionExpression:
          'attribute_exists (#id) AND #templateStatus = :condition_2_templateStatus AND NOT #templateStatus IN (:condition_3_1_templateStatus, :condition_3_2_templateStatus) AND #templateType = :condition_4_templateType AND (#lockNumber = :condition_5_1_lockNumber OR attribute_not_exists (#lockNumber))',
      });

      expect(response).toEqual({
        data: updated,
      });
    });

    test('should correctly update sms template and return updated value', async () => {
      const { templateRepository, mocks } = setup();

      const requestedUpdate: CreateUpdateSMSTemplate = {
        ...smsTemplates.createUpdateTemplate,
        name: 'updated-name',
      };

      const updated: DatabaseTemplate = {
        ...smsTemplates.databaseTemplate,
        ...requestedUpdate,
        lockNumber: 2,
      };

      mocks.ddbDocClient
        .on(UpdateCommand, {
          TableName: templatesTableName,
          Key: { id: 'abc-def-ghi-jkl-123', owner: ownerWithClientPrefix },
        })
        .resolves({
          Attributes: updated,
        });

      const response = await templateRepository.update(
        'abc-def-ghi-jkl-123',
        requestedUpdate,
        user,
        'NOT_YET_SUBMITTED',
        1
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'templates',
        Key: { id: 'abc-def-ghi-jkl-123', owner: 'CLIENT#client-id' },
        ReturnValues: 'ALL_NEW',
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        ExpressionAttributeNames: {
          '#id': 'id',
          '#lockNumber': 'lockNumber',
          '#message': 'message',
          '#name': 'name',
          '#templateStatus': 'templateStatus',
          '#templateType': 'templateType',
          '#updatedAt': 'updatedAt',
          '#updatedBy': 'updatedBy',
        },
        ExpressionAttributeValues: {
          ':condition_2_templateStatus': 'NOT_YET_SUBMITTED',
          ':condition_3_1_templateStatus': 'DELETED',
          ':condition_3_2_templateStatus': 'SUBMITTED',
          ':condition_4_templateType': 'SMS',
          ':condition_5_1_lockNumber': 1,
          ':lockNumber': 1,
          ':message': 'message',
          ':name': 'updated-name',
          ':updatedAt': '2024-12-27T00:00:00.000Z',
          ':updatedBy': `INTERNAL_USER#${internalUserId}`,
        },
        UpdateExpression:
          'SET #name = :name, #message = :message, #updatedAt = :updatedAt, #updatedBy = :updatedBy ADD #lockNumber :lockNumber',
        ConditionExpression:
          'attribute_exists (#id) AND #templateStatus = :condition_2_templateStatus AND NOT #templateStatus IN (:condition_3_1_templateStatus, :condition_3_2_templateStatus) AND #templateType = :condition_4_templateType AND (#lockNumber = :condition_5_1_lockNumber OR attribute_not_exists (#lockNumber))',
      });

      expect(response).toEqual({
        data: updated,
      });
    });

    test('should correctly update nhsapp template and return updated value', async () => {
      const { templateRepository, mocks } = setup();

      const requestedUpdate: CreateUpdateNHSAppTemplate = {
        ...appTemplates.createUpdateTemplate,
        name: 'updated-name',
      };

      const updated: DatabaseTemplate = {
        ...appTemplates.databaseTemplate,
        ...requestedUpdate,
        lockNumber: 2,
      };

      mocks.ddbDocClient
        .on(UpdateCommand, {
          TableName: templatesTableName,
          Key: { id: 'abc-def-ghi-jkl-123', owner: ownerWithClientPrefix },
        })
        .resolves({
          Attributes: updated,
        });

      const response = await templateRepository.update(
        'abc-def-ghi-jkl-123',
        requestedUpdate,
        user,
        'NOT_YET_SUBMITTED',
        1
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'templates',
        Key: { id: 'abc-def-ghi-jkl-123', owner: 'CLIENT#client-id' },
        ReturnValues: 'ALL_NEW',
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        ExpressionAttributeNames: {
          '#id': 'id',
          '#lockNumber': 'lockNumber',
          '#message': 'message',
          '#name': 'name',
          '#templateStatus': 'templateStatus',
          '#templateType': 'templateType',
          '#updatedAt': 'updatedAt',
          '#updatedBy': 'updatedBy',
        },
        ExpressionAttributeValues: {
          ':condition_2_templateStatus': 'NOT_YET_SUBMITTED',
          ':condition_3_1_templateStatus': 'DELETED',
          ':condition_3_2_templateStatus': 'SUBMITTED',
          ':condition_4_templateType': 'NHS_APP',
          ':condition_5_1_lockNumber': 1,
          ':lockNumber': 1,
          ':message': 'message',
          ':name': 'updated-name',
          ':updatedAt': '2024-12-27T00:00:00.000Z',
          ':updatedBy': `INTERNAL_USER#${internalUserId}`,
        },
        UpdateExpression:
          'SET #name = :name, #message = :message, #updatedAt = :updatedAt, #updatedBy = :updatedBy ADD #lockNumber :lockNumber',
        ConditionExpression:
          'attribute_exists (#id) AND #templateStatus = :condition_2_templateStatus AND NOT #templateStatus IN (:condition_3_1_templateStatus, :condition_3_2_templateStatus) AND #templateType = :condition_4_templateType AND (#lockNumber = :condition_5_1_lockNumber OR attribute_not_exists (#lockNumber))',
      });

      expect(response).toEqual({
        data: updated,
      });
    });

    describe('ConditionalCheckException handling', () => {
      const cases = [
        {
          testName: 'when no item is returned in the error',
          errorCode: 404,
          errorMeta: {
            description: 'Template not found',
          },
        },
        {
          testName: 'when user tries to change templateType',
          Item: {
            templateType: { S: 'SMS' },
            templateStatus: { S: 'NOT_YET_SUBMITTED' },
            lockNumber: { N: '1' },
          },
          errorCode: 400,
          errorMeta: {
            description: 'Can not change template templateType',
            details: { templateType: 'Expected SMS but got EMAIL' },
          },
        },
        {
          testName: 'when templateStatus is already SUBMITTED',
          Item: {
            templateType: { S: 'EMAIL' },
            templateStatus: { S: 'SUBMITTED' },
            lockNumber: { N: '1' },
          },
          errorCode: 400,
          errorMeta: {
            description: 'Template with status SUBMITTED cannot be updated',
          },
        },
        {
          testName: 'when templateStatus is already DELETED',
          Item: {
            templateType: { S: 'EMAIL' },
            templateStatus: { S: 'DELETED' },
            lockNumber: { N: '1' },
          },
          errorCode: 404,
          errorMeta: {
            description: 'Template not found',
          },
        },
        {
          testName:
            'when lockNumber in database does not match the user-provided value',
          Item: {
            templateType: { S: 'EMAIL' },
            templateStatus: { S: 'NOT_YET_SUBMITTED' },
            lockNumber: { N: '2' },
          },
          errorCode: 409,
          errorMeta: {
            description:
              'Lock number mismatch - Template has been modified since last read',
          },
        },
      ];

      test.each(cases)(
        'should return $errorCode error when ConditionalCheckFailedException occurs: $testName',
        async ({ Item, errorCode, errorMeta }) => {
          const { templateRepository, mocks } = setup();

          const error = new ConditionalCheckFailedException({
            message: 'mocked',
            $metadata: { httpStatusCode: 400 },
            Item,
          });

          mocks.ddbDocClient.on(UpdateCommand).rejects(error);

          const response = await templateRepository.update(
            'abc-def-ghi-jkl-123',
            {
              name: 'name',
              message: 'message',
              subject: 'subject',
              templateType: 'EMAIL',
            },
            user,
            'NOT_YET_SUBMITTED',
            1
          );

          expect(response).toEqual({
            error: {
              actualError: error,
              errorMeta: { ...errorMeta, code: errorCode },
            },
          });
        }
      );
    });

    test('should return error when, an unexpected error occurs', async () => {
      const { templateRepository, mocks } = setup();

      const error = new Error('mocked');

      mocks.ddbDocClient.on(UpdateCommand).rejects(error);

      const response = await templateRepository.update(
        'abc-def-ghi-jkl-123',
        {
          name: 'name',
          message: 'message',
          subject: 'subject',
          templateType: 'EMAIL',
        },
        user,
        'NOT_YET_SUBMITTED',
        1
      );

      expect(response).toEqual({
        error: {
          actualError: error,
          errorMeta: {
            code: 500,
            description: 'Failed to update template',
          },
        },
      });
    });
  });

  describe('patch', () => {
    test('should correctly patch template and return updated template', async () => {
      const { templateRepository, mocks } = setup();

      const updated: DatabaseTemplate = {
        id: 'abc-def-ghi-jkl-123',
        owner: ownerWithClientPrefix,
        clientId: clientId,
        version: 1,
        name: 'Updated Template Name',
        templateType: 'LETTER',
        templateStatus: 'NOT_YET_SUBMITTED',
        letterType: 'x1',
        language: 'en',
        letterVersion: 'AUTHORING',
        createdAt: '2024-12-27T00:00:00.000Z',
        updatedAt: '2024-12-27T00:00:00.000Z',
        createdBy: `INTERNAL_USER#${internalUserId}`,
        updatedBy: `INTERNAL_USER#${internalUserId}`,
        lockNumber: 6,
      };

      mocks.ddbDocClient
        .on(UpdateCommand, {
          TableName: templatesTableName,
          Key: { id: 'abc-def-ghi-jkl-123', owner: ownerWithClientPrefix },
        })
        .resolves({
          Attributes: updated,
        });

      const response = await templateRepository.patch(
        'abc-def-ghi-jkl-123',
        { name: 'Updated Template Name' },
        user,
        5
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'templates',
        Key: { id: 'abc-def-ghi-jkl-123', owner: 'CLIENT#client-id' },
        ReturnValues: 'ALL_NEW',
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        ExpressionAttributeNames: {
          '#id': 'id',
          '#lockNumber': 'lockNumber',
          '#name': 'name',
          '#templateStatus': 'templateStatus',
          '#updatedAt': 'updatedAt',
          '#updatedBy': 'updatedBy',
        },
        ExpressionAttributeValues: {
          ':condition_2_1_templateStatus': 'DELETED',
          ':condition_2_2_templateStatus': 'SUBMITTED',
          ':condition_3_1_templateStatus': 'PROOF_APPROVED',
          ':condition_4_1_lockNumber': 5,
          ':lockNumber': 1,
          ':name': 'Updated Template Name',
          ':updatedAt': '2024-12-27T00:00:00.000Z',
          ':updatedBy': `INTERNAL_USER#${internalUserId}`,
        },
        UpdateExpression:
          'SET #name = :name, #updatedAt = :updatedAt, #updatedBy = :updatedBy ADD #lockNumber :lockNumber',
        ConditionExpression:
          'attribute_exists (#id) AND NOT #templateStatus IN (:condition_2_1_templateStatus, :condition_2_2_templateStatus) AND NOT #templateStatus IN (:condition_3_1_templateStatus) AND (#lockNumber = :condition_4_1_lockNumber OR attribute_not_exists (#lockNumber))',
      });

      expect(response).toEqual({
        data: updated,
      });
    });

    describe('ConditionalCheckException handling', () => {
      const cases = [
        {
          testName: 'when no item is returned in the error',
          errorCode: 404,
          errorMeta: {
            description: 'Template not found',
          },
        },
        {
          testName: 'when templateStatus is already SUBMITTED',
          Item: {
            templateType: { S: 'LETTER' },
            templateStatus: { S: 'SUBMITTED' },
            lockNumber: { N: '5' },
          },
          errorCode: 400,
          errorMeta: {
            description: 'Template with status SUBMITTED cannot be updated',
          },
        },
        {
          testName: 'when templateStatus is already PROOF_APPROVED',
          Item: {
            templateType: { S: 'LETTER' },
            templateStatus: { S: 'PROOF_APPROVED' },
            lockNumber: { N: '5' },
          },
          errorCode: 400,
          errorMeta: {
            description:
              'Template with status PROOF_APPROVED cannot be updated',
          },
        },
        {
          testName: 'when templateStatus is already DELETED',
          Item: {
            templateType: { S: 'LETTER' },
            templateStatus: { S: 'DELETED' },
            lockNumber: { N: '5' },
          },
          errorCode: 404,
          errorMeta: {
            description: 'Template not found',
          },
        },
        {
          testName:
            'when lockNumber in database does not match the user-provided value',
          Item: {
            templateType: { S: 'LETTER' },
            templateStatus: { S: 'NOT_YET_SUBMITTED' },
            lockNumber: { N: '7' },
          },
          errorCode: 409,
          errorMeta: {
            description:
              'Lock number mismatch - Template has been modified since last read',
          },
        },
      ];

      test.each(cases)(
        'should return $errorCode error when ConditionalCheckFailedException occurs: $testName',
        async ({ Item, errorCode, errorMeta }) => {
          const { templateRepository, mocks } = setup();

          const error = new ConditionalCheckFailedException({
            message: 'mock',
            $metadata: {},
            Item,
          });

          mocks.ddbDocClient.on(UpdateCommand).rejects(error);

          const response = await templateRepository.patch(
            'abc-def-ghi-jkl-123',
            { name: 'Updated Name' },
            user,
            5
          );

          expect(response).toEqual({
            error: {
              actualError: error,
              errorMeta: {
                code: errorCode,
                ...errorMeta,
              },
            },
          });
        }
      );
    });

    test('should return error when an unexpected error occurs', async () => {
      const { templateRepository, mocks } = setup();

      const error = new Error('mocked');

      mocks.ddbDocClient.on(UpdateCommand).rejects(error);

      const response = await templateRepository.patch(
        'abc-def-ghi-jkl-123',
        { name: 'Updated Name' },
        user,
        5
      );

      expect(response).toEqual({
        error: {
          actualError: error,
          errorMeta: {
            code: 500,
            description: 'Failed to update template',
          },
        },
      });
    });
  });

  describe('submit', () => {
    test.each([
      {
        testName: 'When template does not exist',
        Item: undefined,
        code: 404,
        message: 'Template not found',
        returnActualError: false,
      },
      {
        testName:
          'Fails when user tries to submit template when templateStatus is SUBMITTED',
        Item: marshall({
          templateType: 'EMAIL',
          templateStatus: 'SUBMITTED',
          lockNumber: 0,
        }),
        code: 400,
        message: 'Template with status SUBMITTED cannot be updated',
        returnActualError: false,
      },
      {
        testName:
          'Fails when user tries to submit template when templateStatus is PENDING_UPLOAD',
        Item: marshall({
          templateType: 'LETTER',
          templateStatus: 'PENDING_UPLOAD',
          lockNumber: 0,
        }),
        code: 400,
        message: 'Template cannot be submitted',
        returnActualError: true,
      },
      {
        testName:
          'Fails when user tries to submit template when templateStatus is PENDING_VALIDATION',
        Item: marshall({
          templateType: 'LETTER',
          templateStatus: 'PENDING_VALIDATION',
          lockNumber: 0,
        }),
        code: 400,
        message: 'Template cannot be submitted',
        returnActualError: true,
      },
      {
        testName:
          'Fails when user tries to submit template when templateStatus is DELETED',
        Item: marshall({
          templateType: 'EMAIL',
          templateStatus: 'DELETED',
          lockNumber: 0,
        }),
        code: 404,
        message: 'Template not found',
        returnActualError: false,
      },
      {
        testName:
          'Fails when user tries to submit a letter template when any virusScanStatus is not PASSED',
        Item: marshall({
          templateType: 'LETTER',
          templateStatus: 'NOT_YET_SUBMITTED',
          lockNumber: 0,
          files: {
            pdfTemplate: {
              virusScanStatus: 'PASSED',
              currentVersion: 'a',
              fileName: 'pdf.pdf',
            },
            testDataCsv: {
              virusScanStatus: 'FAILED',
              currentVersion: 'a',
              fileName: 'csv.csv',
            },
          },
        }),
        code: 400,
        message: 'Template cannot be submitted',
        returnActualError: true,
      },
      {
        testName: 'Fails when stored lock number differs from input',
        Item: marshall({
          templateType: 'SMS',
          templateStatus: 'NOT_YET_SUBMITTED',
          lockNumber: 1,
        }),
        code: 409,
        message:
          'Lock number mismatch - Template has been modified since last read',
        returnActualError: true,
      },
    ])(
      'submit: $testName',
      async ({ Item, code, message, returnActualError }) => {
        const { templateRepository, mocks } = setup();

        const error = new ConditionalCheckFailedException({
          message: 'mocked',
          $metadata: { httpStatusCode: 400 },
          Item,
        });

        mocks.ddbDocClient.on(UpdateCommand).rejects(error);

        const response = await templateRepository.submit(
          'abc-def-ghi-jkl-123',
          user,
          0
        );

        expect(response).toEqual({
          error: {
            ...(returnActualError ? { actualError: error } : {}),
            errorMeta: {
              code,
              description: message,
            },
          },
        });
      }
    );

    test('should return error when, an unexpected error occurs', async () => {
      const { templateRepository, mocks } = setup();

      const error = new Error('mocked');

      mocks.ddbDocClient.on(UpdateCommand).rejects(error);

      const response = await templateRepository.submit(
        'abc-def-ghi-jkl-123',
        user,
        0
      );

      expect(response).toEqual({
        error: {
          actualError: error,
          errorMeta: {
            code: 500,
            description: 'Failed to update template',
          },
        },
      });
    });

    test('should update template status to SUBMITTED', async () => {
      const { templateRepository, mocks } = setup();
      const id = 'abc-def-ghi-jkl-123';

      const databaseTemplate: DatabaseTemplate = {
        id,
        owner: ownerWithClientPrefix,
        version: 1,
        name: 'updated-name',
        message: 'updated-message',
        templateStatus: 'SUBMITTED',
        templateType: 'NHS_APP',
        updatedAt: 'now',
        createdAt: 'yesterday',
        lockNumber: 1,
      };

      mocks.ddbDocClient
        .on(UpdateCommand, {
          TableName: templatesTableName,
          Key: { id, owner: ownerWithClientPrefix },
        })
        .resolves({ Attributes: databaseTemplate });

      const response = await templateRepository.submit(id, user, 0);

      expect(response).toEqual({
        data: databaseTemplate,
      });

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'templates',
        Key: { id: 'abc-def-ghi-jkl-123', owner: 'CLIENT#client-id' },
        ReturnValues: 'ALL_NEW',
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        ExpressionAttributeNames: {
          '#lockNumber': 'lockNumber',
          '#templateStatus': 'templateStatus',
          '#updatedAt': 'updatedAt',
          '#updatedBy': 'updatedBy',
        },
        ExpressionAttributeValues: {
          ':deleted': 'DELETED',
          ':expectedLockNumber': 0,
          ':expectedStatus': 'NOT_YET_SUBMITTED',
          ':expectedProofingLetterStatus': 'PROOF_AVAILABLE',
          ':lockNumberIncrement': 1,
          ':newStatus': 'SUBMITTED',
          ':passed': 'PASSED',
          ':submitted': 'SUBMITTED',
          ':updatedAt': '2024-12-27T00:00:00.000Z',
          ':updatedBy': `INTERNAL_USER#${internalUserId}`,
        },

        UpdateExpression:
          'SET #templateStatus = :newStatus, #updatedAt = :updatedAt, #updatedBy = :updatedBy ADD #lockNumber :lockNumberIncrement',
        ConditionExpression:
          'attribute_exists(id) AND NOT #templateStatus IN (:deleted, :submitted) AND (attribute_not_exists(files.pdfTemplate) OR files.pdfTemplate.virusScanStatus = :passed) AND (attribute_not_exists(files.testDataCsv) OR files.testDataCsv.virusScanStatus = :passed) AND (#templateStatus = :expectedStatus OR #templateStatus = :expectedProofingLetterStatus) AND (attribute_not_exists(#lockNumber) OR #lockNumber = :expectedLockNumber)',
      });
    });
  });

  describe('approveProof', () => {
    test('should update template status to PROOF_APPROVED', async () => {
      const { templateRepository, mocks } = setup();
      const id = 'abc-def-ghi-jkl-123';

      const databaseTemplate: DatabaseTemplate = {
        id,
        owner: ownerWithClientPrefix,
        version: 1,
        name: 'updated-name',
        message: 'updated-message',
        templateStatus: 'PROOF_APPROVED',
        templateType: 'NHS_APP',
        updatedAt: 'now',
        createdAt: 'yesterday',
        lockNumber: 1,
      };

      mocks.ddbDocClient
        .on(UpdateCommand, {
          TableName: templatesTableName,
          Key: { id, owner: ownerWithClientPrefix },
        })
        .resolves({ Attributes: databaseTemplate });

      const response = await templateRepository.approveProof(id, user, 0);

      expect(response).toEqual({
        data: databaseTemplate,
      });

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'templates',
        Key: { id: 'abc-def-ghi-jkl-123', owner: 'CLIENT#client-id' },
        ReturnValues: 'ALL_NEW',
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        ExpressionAttributeNames: {
          '#lockNumber': 'lockNumber',
          '#templateStatus': 'templateStatus',
          '#updatedAt': 'updatedAt',
          '#updatedBy': 'updatedBy',
        },
        ExpressionAttributeValues: {
          ':deleted': 'DELETED',
          ':expectedLockNumber': 0,
          ':expectedProofingLetterStatus': 'PROOF_AVAILABLE',
          ':lockNumberIncrement': 1,
          ':newStatus': 'PROOF_APPROVED',
          ':passed': 'PASSED',
          ':submitted': 'SUBMITTED',
          ':updatedAt': '2024-12-27T00:00:00.000Z',
          ':updatedBy': `INTERNAL_USER#${internalUserId}`,
        },

        UpdateExpression:
          'SET #templateStatus = :newStatus, #updatedAt = :updatedAt, #updatedBy = :updatedBy ADD #lockNumber :lockNumberIncrement',
        ConditionExpression:
          'attribute_exists(id) AND NOT #templateStatus IN (:deleted, :submitted) AND (attribute_not_exists(files.pdfTemplate) OR files.pdfTemplate.virusScanStatus = :passed) AND (attribute_not_exists(files.testDataCsv) OR files.testDataCsv.virusScanStatus = :passed) AND #templateStatus = :expectedProofingLetterStatus AND (attribute_not_exists(#lockNumber) OR #lockNumber = :expectedLockNumber)',
      });
    });

    test('should return error when lock number mismatch', async () => {
      const { templateRepository, mocks } = setup();

      const error = new ConditionalCheckFailedException({
        message: 'mocked',
        $metadata: { httpStatusCode: 400 },
        Item: marshall({
          templateType: 'LETTER',
          templateStatus: 'PROOF_AVAILABLE',
          lockNumber: 1,
        }),
      });

      mocks.ddbDocClient.on(UpdateCommand).rejects(error);

      const response = await templateRepository.approveProof(
        'abc-def-ghi-jkl-123',
        user,
        0
      );

      expect(response).toEqual({
        error: {
          actualError: error,
          errorMeta: {
            code: 409,
            description:
              'Lock number mismatch - Template has been modified since last read',
          },
        },
      });
    });

    test('should return error when template cannot be approved', async () => {
      const { templateRepository, mocks } = setup();

      const error = new ConditionalCheckFailedException({
        message: 'mocked',
        $metadata: { httpStatusCode: 400 },
        Item: marshall({
          templateType: 'LETTER',
          templateStatus: 'NOT_YET_SUBMITTED',
          lockNumber: 0,
        }),
      });

      mocks.ddbDocClient.on(UpdateCommand).rejects(error);

      const response = await templateRepository.approveProof(
        'abc-def-ghi-jkl-123',
        user,
        0
      );

      expect(response).toEqual({
        error: {
          actualError: error,
          errorMeta: {
            code: 400,
            description: 'Proof cannot be approved',
          },
        },
      });
    });

    test('should return error when unexpected error occurs', async () => {
      const { templateRepository, mocks } = setup();

      const error = new Error('mocked');

      mocks.ddbDocClient.on(UpdateCommand).rejects(error);

      const response = await templateRepository.approveProof(
        'abc-def-ghi-jkl-123',
        user,
        0
      );

      expect(response).toEqual({
        error: {
          actualError: error,
          errorMeta: {
            code: 500,
            description: 'Failed to update template',
          },
        },
      });
    });
  });

  describe('delete', () => {
    test('should update templateStatus to DELETED', async () => {
      const { templateRepository, mocks } = setup();
      const id = 'abc-def-ghi-jkl-123';

      await templateRepository.delete(id, user, 1);

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'templates',
        Key: { id: 'abc-def-ghi-jkl-123', owner: 'CLIENT#client-id' },
        ReturnValues: 'ALL_NEW',
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        ExpressionAttributeNames: {
          '#id': 'id',
          '#lockNumber': 'lockNumber',
          '#templateStatus': 'templateStatus',
          '#ttl': 'ttl',
          '#updatedAt': 'updatedAt',
          '#updatedBy': 'updatedBy',
        },
        ExpressionAttributeValues: {
          ':condition_2_1_templateStatus': 'DELETED',
          ':condition_2_2_templateStatus': 'SUBMITTED',
          ':condition_3_1_lockNumber': 1,
          ':lockNumber': 1,
          ':templateStatus': 'DELETED',
          ':ttl': 1000,
          ':updatedAt': '2024-12-27T00:00:00.000Z',
          ':updatedBy': `INTERNAL_USER#${internalUserId}`,
        },
        UpdateExpression:
          'SET #templateStatus = :templateStatus, #ttl = :ttl, #updatedAt = :updatedAt, #updatedBy = :updatedBy ADD #lockNumber :lockNumber',
        ConditionExpression:
          'attribute_exists (#id) AND NOT #templateStatus IN (:condition_2_1_templateStatus, :condition_2_2_templateStatus) AND (#lockNumber = :condition_3_1_lockNumber OR attribute_not_exists (#lockNumber))',
      });
    });

    describe('ConditionalCheckException handling', () => {
      const cases = [
        {
          testName: 'when no item is returned in the error',
          errorCode: 404,
          errorMeta: { description: 'Template not found' },
        },
        {
          testName: 'when templateStatus is already SUBMITTED',
          Item: {
            templateType: { S: 'EMAIL' },
            templateStatus: { S: 'SUBMITTED' },
            lockNumber: { N: '1' },
          },
          errorCode: 400,
          errorMeta: {
            description: 'Template with status SUBMITTED cannot be updated',
          },
        },
        {
          testName: 'when templateStatus is already DELETED',
          Item: {
            templateType: { S: 'EMAIL' },
            templateStatus: { S: 'DELETED' },
            lockNumber: { N: '1' },
          },
          errorCode: 404,
          errorMeta: { description: 'Template not found' },
        },
        {
          testName:
            'when lockNumber in database does not match the user-provided value',
          Item: {
            templateType: { S: 'EMAIL' },
            templateStatus: { S: 'NOT_YET_SUBMITTED' },
            lockNumber: { N: '2' },
          },
          errorCode: 409,
          errorMeta: {
            description:
              'Lock number mismatch - Template has been modified since last read',
          },
        },
      ];

      test.each(cases)(
        'should return $errorCode error when ConditionalCheckFailedException occurs: $testName',
        async ({ Item, errorCode, errorMeta }) => {
          const { templateRepository, mocks } = setup();

          const error = new ConditionalCheckFailedException({
            message: 'mocked',
            $metadata: { httpStatusCode: 400 },
            Item,
          });

          mocks.ddbDocClient.on(UpdateCommand).rejects(error);

          const response = await templateRepository.delete(
            'abc-def-ghi-jkl-123',
            user,
            1
          );

          expect(response).toEqual({
            error: {
              actualError: error,
              errorMeta: {
                ...errorMeta,
                code: errorCode,
              },
            },
          });
        }
      );
    });

    test('should return error when, an unexpected error occurs', async () => {
      const { templateRepository, mocks } = setup();

      const error = new Error('mocked');

      mocks.ddbDocClient.on(UpdateCommand).rejects(error);

      const response = await templateRepository.delete(
        'abc-def-ghi-jkl-123',
        user,
        1
      );

      expect(response).toEqual({
        error: {
          actualError: error,
          errorMeta: {
            code: 500,
            description: 'Failed to delete template',
          },
        },
      });
    });
  });

  describe('finaliseLetterUpload', () => {
    test.each([
      {
        Item: undefined,
        code: 404,
        message: 'Template not found',
      },
      {
        testName:
          'Fails when user tries to update template when templateStatus is SUBMITTED',
        Item: {
          templateType: { S: 'EMAIL' },
          templateStatus: { S: 'SUBMITTED' },
        },
        code: 400,
        message: 'Template with status SUBMITTED cannot be updated',
      },
      {
        testName:
          'Fails when user tries to update template when templateStatus is DELETED',
        Item: {
          templateType: { S: 'EMAIL' },
          templateStatus: { S: 'DELETED' },
        },
        code: 404,
        message: 'Template not found',
      },
    ])(
      'should return error when, ConditionalCheckFailedException occurs and no Item is returned %p',
      async ({ Item, code, message }) => {
        const { templateRepository, mocks } = setup();

        const error = new ConditionalCheckFailedException({
          message: 'mocked',
          $metadata: { httpStatusCode: 400 },
          Item,
        });

        mocks.ddbDocClient.on(UpdateCommand).rejects(error);

        const response = await templateRepository.finaliseLetterUpload(
          'abc-def-ghi-jkl-123',
          user
        );

        expect(response).toEqual({
          error: {
            errorMeta: {
              code,
              description: message,
            },
          },
        });
      }
    );

    test('should return error when, an unexpected error occurs', async () => {
      const { templateRepository, mocks } = setup();

      const error = new Error('mocked');

      mocks.ddbDocClient.on(UpdateCommand).rejects(error);

      const response = await templateRepository.finaliseLetterUpload(
        'abc-def-ghi-jkl-123',
        user
      );

      expect(response).toEqual({
        error: {
          actualError: error,
          errorMeta: {
            code: 500,
            description: 'Failed to update template',
          },
        },
      });
    });

    test('should update templateStatus to PENDING_VALIDATION', async () => {
      const { templateRepository, mocks } = setup();
      const id = 'abc-def-ghi-jkl-123';

      const databaseTemplate: DatabaseTemplate = {
        id,
        owner: ownerWithClientPrefix,
        version: 1,
        name: 'updated-name',
        message: 'updated-message',
        templateStatus: 'PENDING_VALIDATION',
        templateType: 'NHS_APP',
        updatedAt: 'now',
        createdAt: 'yesterday',
      };

      mocks.ddbDocClient
        .on(UpdateCommand, {
          TableName: templatesTableName,
          Key: { id: 'abc-def-ghi-jkl-123', owner: ownerWithClientPrefix },
        })
        .resolves({
          Attributes: {
            ...databaseTemplate,
          },
        });

      const response = await templateRepository.finaliseLetterUpload(
        'abc-def-ghi-jkl-123',
        user
      );

      expect(response).toEqual({
        data: databaseTemplate,
      });

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'templates',
        Key: { id: 'abc-def-ghi-jkl-123', owner: 'CLIENT#client-id' },
        ReturnValues: 'ALL_NEW',
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        ExpressionAttributeNames: {
          '#templateStatus': 'templateStatus',
          '#updatedAt': 'updatedAt',
          '#updatedBy': 'updatedBy',
          '#lockNumber': 'lockNumber',
        },
        ExpressionAttributeValues: {
          ':deleted': 'DELETED',
          ':newStatus': 'PENDING_VALIDATION',
          ':submitted': 'SUBMITTED',
          ':updatedAt': '2024-12-27T00:00:00.000Z',
          ':updatedBy': `INTERNAL_USER#${internalUserId}`,
          ':lockNumberIncrement': 1,
        },
        UpdateExpression:
          'SET #templateStatus = :newStatus, #updatedAt = :updatedAt, #updatedBy = :updatedBy ADD #lockNumber :lockNumberIncrement',
        ConditionExpression:
          'attribute_exists(id) AND NOT #templateStatus IN (:deleted, :submitted)',
      });
    });
  });

  describe('setLetterFileVirusScanStatusForProof', () => {
    it('adds the virus scan status of the proof to the database record and updates the template status if scan status is passed', async () => {
      const { templateRepository, mocks } = setup();
      mocks.ddbDocClient.on(UpdateCommand).resolves({
        Attributes: {
          templateStatus: 'WAITING_FOR_PROOF',
        },
      });

      await templateRepository.setLetterFileVirusScanStatusForProof(
        { clientId, templateId: 'template-id' },
        'pdf-template.pdf',
        'PASSED',
        'MBA'
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'templates',
        Key: { id: 'template-id', owner: ownerWithClientPrefix },
        UpdateExpression:
          'SET files.proofs.#fileName = :virusScanResult, updatedAt = :updatedAt ADD #lockNumber :lockNumberIncrement',
        ConditionExpression:
          'attribute_not_exists(files.proofs.#fileName) and not templateStatus in (:templateStatusDeleted, :templateStatusSubmitted)',
        ExpressionAttributeNames: {
          '#fileName': 'pdf-template.pdf',
          '#lockNumber': 'lockNumber',
        },
        ExpressionAttributeValues: {
          ':templateStatusDeleted': 'DELETED',
          ':templateStatusSubmitted': 'SUBMITTED',
          ':updatedAt': new Date().toISOString(),
          ':virusScanResult': {
            fileName: 'pdf-template.pdf',
            virusScanStatus: 'PASSED',
            supplier: 'MBA',
          },
          ':lockNumberIncrement': 1,
        },
      });

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'templates',
        Key: { id: 'template-id', owner: ownerWithClientPrefix },
        UpdateExpression:
          'SET templateStatus = :templateStatusProofAvailable, updatedAt = :updatedAt ADD #lockNumber :lockNumberIncrement',
        ExpressionAttributeNames: {
          '#lockNumber': 'lockNumber',
        },
        ExpressionAttributeValues: {
          ':templateStatusWaitingForProof': 'WAITING_FOR_PROOF',
          ':templateStatusProofAvailable': 'PROOF_AVAILABLE',
          ':updatedAt': new Date().toISOString(),
          ':lockNumberIncrement': 1,
        },
        ConditionExpression: 'templateStatus = :templateStatusWaitingForProof',
      });
    });

    it('adds the virus scan status of the proof to the database record and does not update the template status if scan status is failed', async () => {
      const { templateRepository, mocks } = setup();
      mocks.ddbDocClient.on(UpdateCommand).resolves({
        Attributes: {
          templateStatus: 'WAITING_FOR_PROOF',
        },
      });

      await templateRepository.setLetterFileVirusScanStatusForProof(
        { clientId, templateId: 'template-id' },
        'pdf-template.pdf',
        'FAILED',
        'MBA'
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'templates',
        Key: { id: 'template-id', owner: ownerWithClientPrefix },
        UpdateExpression:
          'SET files.proofs.#fileName = :virusScanResult, updatedAt = :updatedAt ADD #lockNumber :lockNumberIncrement',
        ConditionExpression:
          'attribute_not_exists(files.proofs.#fileName) and not templateStatus in (:templateStatusDeleted, :templateStatusSubmitted)',
        ExpressionAttributeNames: {
          '#fileName': 'pdf-template.pdf',
          '#lockNumber': 'lockNumber',
        },
        ExpressionAttributeValues: {
          ':templateStatusDeleted': 'DELETED',
          ':templateStatusSubmitted': 'SUBMITTED',
          ':updatedAt': new Date().toISOString(),
          ':virusScanResult': {
            fileName: 'pdf-template.pdf',
            virusScanStatus: 'FAILED',
            supplier: 'MBA',
          },
          ':lockNumberIncrement': 1,
        },
      });

      expect(mocks.ddbDocClient).toHaveReceivedCommandTimes(UpdateCommand, 1);
    });

    it('swallows ConditionalCheckFailedExceptions for the first update', async () => {
      const { templateRepository, mocks } = setup();
      mocks.ddbDocClient.on(UpdateCommand).rejects(
        new ConditionalCheckFailedException({
          $metadata: {},
          message: 'Condition Check Failed',
        })
      );

      await expect(
        templateRepository.setLetterFileVirusScanStatusForProof(
          { clientId, templateId: 'template-id' },
          'pdf-template',
          'PASSED',
          'MBA'
        )
      ).resolves.not.toThrow();
    });

    it('swallows ConditionalCheckFailedExceptions for the second update', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient
        .on(UpdateCommand)
        .resolvesOnce({
          Attributes: {
            templateStatus: 'WAITING_FOR_PROOF',
          },
        })
        .rejects(
          new ConditionalCheckFailedException({
            $metadata: {},
            message: 'Condition Check Failed',
          })
        );

      await expect(
        templateRepository.setLetterFileVirusScanStatusForProof(
          { clientId, templateId: 'template-id' },
          'pdf-template',
          'PASSED',
          'MBA'
        )
      ).resolves.not.toThrow();
    });

    it('raises other exceptions from the database for the first update', async () => {
      const { templateRepository, mocks } = setup();
      mocks.ddbDocClient
        .on(UpdateCommand)
        .rejects(new Error('Something went wrong'));

      await expect(
        templateRepository.setLetterFileVirusScanStatusForProof(
          { clientId, templateId: 'template-id' },
          'pdf-template',
          'PASSED',
          'MBA'
        )
      ).rejects.toThrow('Something went wrong');
    });

    it('raises other exceptions from the database for the second update', async () => {
      const { templateRepository, mocks } = setup();
      mocks.ddbDocClient
        .on(UpdateCommand)
        .resolvesOnce({
          Attributes: {
            templateStatus: 'WAITING_FOR_PROOF',
          },
        })
        .rejects(new Error('Something went wrong'));

      await expect(
        templateRepository.setLetterFileVirusScanStatusForProof(
          { clientId, templateId: 'template-id' },
          'pdf-template',
          'PASSED',
          'MBA'
        )
      ).rejects.toThrow('Something went wrong');
    });
  });

  describe('getClientId', () => {
    it('gets clientId', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient.on(QueryCommand).resolves({
        Items: [
          {
            owner: 'CLIENT#template-owner',
          },
        ],
      });

      const owner = await templateRepository.getClientId('template-id');

      expect(owner).toEqual('template-owner');
    });

    it('errors if owner does not start with CLIENT#', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient.on(QueryCommand).resolves({
        Items: [
          {
            owner: 'NOTCLIENT#template-owner',
          },
        ],
      });

      await expect(() =>
        templateRepository.getClientId('template-id')
      ).rejects.toThrow('Unexpected owner format NOTCLIENT#template-owner');
    });

    it('errors when owner cannot be found', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient.on(QueryCommand).resolves({
        Items: [],
      });

      await expect(() =>
        templateRepository.getClientId('template-id')
      ).rejects.toThrow('Could not identify item by id template-id');
    });
  });

  describe('setLetterFileVirusScanStatusForUpload', () => {
    it('updates the virusScanStatus on the pdfTemplate field when the status is PASSED', async () => {
      const { templateRepository, mocks } = setup();

      await templateRepository.setLetterFileVirusScanStatusForUpload(
        { clientId, templateId: 'template-id' },
        'pdf-template',
        'pdf-version-id',
        'PASSED'
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'templates',
        Key: { id: 'template-id', owner: ownerWithClientPrefix },
        UpdateExpression:
          'SET #files.#file.#scanStatus = :scanStatus , #updatedAt = :updatedAt ADD #lockNumber :lockNumberIncrement',
        ConditionExpression:
          '#files.#file.#version = :version and not #templateStatus in (:templateStatusDeleted, :templateStatusSubmitted)',
        ExpressionAttributeNames: {
          '#file': 'pdfTemplate',
          '#files': 'files',
          '#scanStatus': 'virusScanStatus',
          '#templateStatus': 'templateStatus',
          '#updatedAt': 'updatedAt',
          '#version': 'currentVersion',
          '#lockNumber': 'lockNumber',
        },
        ExpressionAttributeValues: {
          ':scanStatus': 'PASSED',
          ':templateStatusDeleted': 'DELETED',
          ':templateStatusSubmitted': 'SUBMITTED',
          ':updatedAt': '2024-12-27T00:00:00.000Z',
          ':version': 'pdf-version-id',
          ':lockNumberIncrement': 1,
        },
      });
    });

    it('updates the virusScanStatus on the testDataCsv field when the status is PASSED', async () => {
      const { templateRepository, mocks } = setup();

      await templateRepository.setLetterFileVirusScanStatusForUpload(
        { clientId, templateId: 'template-id' },
        'test-data',
        'csv-version-id',
        'PASSED'
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'templates',
        Key: { id: 'template-id', owner: ownerWithClientPrefix },
        UpdateExpression:
          'SET #files.#file.#scanStatus = :scanStatus , #updatedAt = :updatedAt ADD #lockNumber :lockNumberIncrement',
        ConditionExpression:
          '#files.#file.#version = :version and not #templateStatus in (:templateStatusDeleted, :templateStatusSubmitted)',
        ExpressionAttributeNames: {
          '#file': 'testDataCsv',
          '#files': 'files',
          '#scanStatus': 'virusScanStatus',
          '#templateStatus': 'templateStatus',
          '#updatedAt': 'updatedAt',
          '#version': 'currentVersion',
          '#lockNumber': 'lockNumber',
        },
        ExpressionAttributeValues: {
          ':scanStatus': 'PASSED',
          ':templateStatusDeleted': 'DELETED',
          ':templateStatusSubmitted': 'SUBMITTED',
          ':updatedAt': '2024-12-27T00:00:00.000Z',
          ':version': 'csv-version-id',
          ':lockNumberIncrement': 1,
        },
      });
    });

    it('updates the virusScanStatus on the pdfTemplate field and the overall template status when the status is FAILED', async () => {
      const { templateRepository, mocks } = setup();

      await templateRepository.setLetterFileVirusScanStatusForUpload(
        { clientId, templateId: 'template-id' },
        'pdf-template',
        'pdf-version-id',
        'FAILED'
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'templates',
        Key: { id: 'template-id', owner: ownerWithClientPrefix },
        UpdateExpression:
          'SET #files.#file.#scanStatus = :scanStatus , #updatedAt = :updatedAt , #templateStatus = :templateStatusFailed ADD #lockNumber :lockNumberIncrement',
        ConditionExpression:
          '#files.#file.#version = :version and not #templateStatus in (:templateStatusDeleted, :templateStatusSubmitted)',
        ExpressionAttributeNames: {
          '#file': 'pdfTemplate',
          '#files': 'files',
          '#scanStatus': 'virusScanStatus',
          '#templateStatus': 'templateStatus',
          '#updatedAt': 'updatedAt',
          '#version': 'currentVersion',
          '#lockNumber': 'lockNumber',
        },
        ExpressionAttributeValues: {
          ':scanStatus': 'FAILED',
          ':templateStatusDeleted': 'DELETED',
          ':templateStatusFailed': 'VIRUS_SCAN_FAILED',
          ':templateStatusSubmitted': 'SUBMITTED',
          ':updatedAt': '2024-12-27T00:00:00.000Z',
          ':version': 'pdf-version-id',
          ':lockNumberIncrement': 1,
        },
      });
    });

    it('updates the virusScanStatus on the testDataCsv field and the overall template status when the status is FAILED', async () => {
      const { templateRepository, mocks } = setup();

      await templateRepository.setLetterFileVirusScanStatusForUpload(
        { clientId, templateId: 'template-id' },
        'test-data',
        'csv-version-id',
        'FAILED'
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'templates',
        Key: { id: 'template-id', owner: ownerWithClientPrefix },
        UpdateExpression:
          'SET #files.#file.#scanStatus = :scanStatus , #updatedAt = :updatedAt , #templateStatus = :templateStatusFailed ADD #lockNumber :lockNumberIncrement',
        ConditionExpression:
          '#files.#file.#version = :version and not #templateStatus in (:templateStatusDeleted, :templateStatusSubmitted)',
        ExpressionAttributeNames: {
          '#file': 'testDataCsv',
          '#files': 'files',
          '#scanStatus': 'virusScanStatus',
          '#templateStatus': 'templateStatus',
          '#updatedAt': 'updatedAt',
          '#version': 'currentVersion',
          '#lockNumber': 'lockNumber',
        },
        ExpressionAttributeValues: {
          ':scanStatus': 'FAILED',
          ':templateStatusDeleted': 'DELETED',
          ':templateStatusFailed': 'VIRUS_SCAN_FAILED',
          ':templateStatusSubmitted': 'SUBMITTED',
          ':updatedAt': '2024-12-27T00:00:00.000Z',
          ':version': 'csv-version-id',
          ':lockNumberIncrement': 1,
        },
      });
    });

    it('swallows ConditionalCheckFailedExceptions', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient.rejects(
        new ConditionalCheckFailedException({
          $metadata: {},
          message: 'Condition Check Failed',
        })
      );

      await expect(
        templateRepository.setLetterFileVirusScanStatusForUpload(
          {
            clientId: ownerWithClientPrefix,
            templateId: 'template-id',
          },
          'test-data',
          'csv-version-id',
          'FAILED'
        )
      ).resolves.not.toThrow();
    });

    it('raises other exceptions from the database', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient.rejects(new Error('Something went wrong'));

      await expect(
        templateRepository.setLetterFileVirusScanStatusForUpload(
          { clientId, templateId: 'template-id' },
          'test-data',
          'csv-version-id',
          'FAILED'
        )
      ).rejects.toThrow('Something went wrong');
    });
  });

  describe('setLetterValidationResult', () => {
    describe('when proofing is enabled for the client', () => {
      const { templateRepository, mocks } = setup();

      it('should update the templateStatus to PENDING_PROOF_REQUEST, personalisationParameters and csvHeader when template is valid', async () => {
        await templateRepository.setLetterValidationResult(
          { clientId, templateId: 'template-id' },
          'file-version-id',
          true,
          ['personalisation', 'parameters'],
          ['csv', 'headers'],
          true
        );

        expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
          TableName: 'templates',
          Key: { id: 'template-id', owner: ownerWithClientPrefix },
          UpdateExpression:
            'SET #templateStatus = :templateStatus , #updatedAt = :updatedAt , #personalisationParameters = :personalisationParameters , #testDataCsvHeaders = :testDataCsvHeaders ADD #lockNumber :lockNumberIncrement',
          ConditionExpression:
            '#files.#file.#version = :version and not #templateStatus in (:templateStatusDeleted, :templateStatusSubmitted)',
          ExpressionAttributeNames: {
            '#testDataCsvHeaders': 'testDataCsvHeaders',
            '#file': 'pdfTemplate',
            '#files': 'files',
            '#personalisationParameters': 'personalisationParameters',
            '#templateStatus': 'templateStatus',
            '#updatedAt': 'updatedAt',
            '#version': 'currentVersion',
            '#lockNumber': 'lockNumber',
          },
          ExpressionAttributeValues: {
            ':testDataCsvHeaders': ['csv', 'headers'],
            ':personalisationParameters': ['personalisation', 'parameters'],
            ':templateStatus': 'PENDING_PROOF_REQUEST',
            ':templateStatusDeleted': 'DELETED',
            ':templateStatusSubmitted': 'SUBMITTED',
            ':updatedAt': '2024-12-27T00:00:00.000Z',
            ':version': 'file-version-id',
            ':lockNumberIncrement': 1,
          },
        });
      });

      it('should update the templateStatus to VALIDATION_FAILED when template is not valid', async () => {
        await templateRepository.setLetterValidationResult(
          { clientId, templateId: 'template-id' },
          'file-version-id',
          false,
          [],
          [],
          true
        );

        expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
          TableName: 'templates',
          Key: { id: 'template-id', owner: ownerWithClientPrefix },
          UpdateExpression:
            'SET #templateStatus = :templateStatus , #updatedAt = :updatedAt ADD #lockNumber :lockNumberIncrement',
          ConditionExpression:
            '#files.#file.#version = :version and not #templateStatus in (:templateStatusDeleted, :templateStatusSubmitted)',
          ExpressionAttributeNames: {
            '#file': 'pdfTemplate',
            '#files': 'files',
            '#templateStatus': 'templateStatus',
            '#updatedAt': 'updatedAt',
            '#version': 'currentVersion',
            '#lockNumber': 'lockNumber',
          },
          ExpressionAttributeValues: {
            ':templateStatus': 'VALIDATION_FAILED',
            ':templateStatusDeleted': 'DELETED',
            ':templateStatusSubmitted': 'SUBMITTED',
            ':updatedAt': '2024-12-27T00:00:00.000Z',
            ':version': 'file-version-id',
            ':lockNumberIncrement': 1,
          },
        });
      });
    });

    describe('when proofing is disabled for the client', () => {
      test('updates the templateStatus to NOT_YET_SUBMITTED', async () => {
        const { templateRepository, mocks } = setup();

        await templateRepository.setLetterValidationResult(
          { clientId, templateId: 'template-id' },
          'file-version-id',
          true,
          ['personalisation', 'parameters'],
          ['csv', 'headers'],
          false
        );

        expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
          TableName: 'templates',
          Key: { id: 'template-id', owner: ownerWithClientPrefix },
          UpdateExpression:
            'SET #templateStatus = :templateStatus , #updatedAt = :updatedAt , #personalisationParameters = :personalisationParameters , #testDataCsvHeaders = :testDataCsvHeaders ADD #lockNumber :lockNumberIncrement',
          ConditionExpression:
            '#files.#file.#version = :version and not #templateStatus in (:templateStatusDeleted, :templateStatusSubmitted)',
          ExpressionAttributeNames: {
            '#testDataCsvHeaders': 'testDataCsvHeaders',
            '#file': 'pdfTemplate',
            '#files': 'files',
            '#personalisationParameters': 'personalisationParameters',
            '#templateStatus': 'templateStatus',
            '#updatedAt': 'updatedAt',
            '#version': 'currentVersion',
            '#lockNumber': 'lockNumber',
          },
          ExpressionAttributeValues: {
            ':testDataCsvHeaders': ['csv', 'headers'],
            ':personalisationParameters': ['personalisation', 'parameters'],
            ':templateStatus': 'NOT_YET_SUBMITTED',
            ':templateStatusDeleted': 'DELETED',
            ':templateStatusSubmitted': 'SUBMITTED',
            ':updatedAt': '2024-12-27T00:00:00.000Z',
            ':version': 'file-version-id',
            ':lockNumberIncrement': 1,
          },
        });
      });

      it('updates the templateStatus to VALIDATION_FAILED if not valid', async () => {
        const { templateRepository, mocks } = setup();

        await templateRepository.setLetterValidationResult(
          { clientId, templateId: 'template-id' },
          'file-version-id',
          false,
          [],
          [],
          false
        );

        expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
          TableName: 'templates',
          Key: { id: 'template-id', owner: ownerWithClientPrefix },
          UpdateExpression:
            'SET #templateStatus = :templateStatus , #updatedAt = :updatedAt ADD #lockNumber :lockNumberIncrement',
          ConditionExpression:
            '#files.#file.#version = :version and not #templateStatus in (:templateStatusDeleted, :templateStatusSubmitted)',
          ExpressionAttributeNames: {
            '#file': 'pdfTemplate',
            '#files': 'files',
            '#templateStatus': 'templateStatus',
            '#updatedAt': 'updatedAt',
            '#version': 'currentVersion',
            '#lockNumber': 'lockNumber',
          },
          ExpressionAttributeValues: {
            ':templateStatus': 'VALIDATION_FAILED',
            ':templateStatusDeleted': 'DELETED',
            ':templateStatusSubmitted': 'SUBMITTED',
            ':updatedAt': '2024-12-27T00:00:00.000Z',
            ':version': 'file-version-id',
            ':lockNumberIncrement': 1,
          },
        });
      });
    });

    it('swallows ConditionalCheckFailedExceptions', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient.rejects(
        new ConditionalCheckFailedException({
          $metadata: {},
          message: 'Condition Check Failed',
        })
      );

      await expect(
        templateRepository.setLetterValidationResult(
          { clientId, templateId: 'template-id' },
          'file-version-id',
          false,
          [],
          [],
          false
        )
      ).resolves.not.toThrow();
    });

    it('raises other exceptions from the database', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient.rejects(new Error('Something went wrong'));

      await expect(
        templateRepository.setLetterValidationResult(
          {
            templateId: 'template-owner',
            clientId: ownerWithClientPrefix,
          },
          'file-version-id',
          false,
          [],
          [],
          false
        )
      ).rejects.toThrow('Something went wrong');
    });
  });

  describe('proofRequestUpdate', () => {
    it('updates status to WAITING_FOR_PROOF', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient.on(UpdateCommand).resolvesOnce({
        Attributes: {
          // complete template
          id: 'template-id',
        },
      });

      const result = await templateRepository.proofRequestUpdate(
        'template-id',
        user,
        0
      );

      expect(result).toEqual({ data: { id: 'template-id' } });

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        ConditionExpression:
          '#templateStatus = :condition_1_templateStatus AND #templateType = :condition_2_templateType AND #clientId = :condition_3_clientId AND #proofingEnabled = :condition_4_proofingEnabled AND (#lockNumber = :condition_5_1_lockNumber OR attribute_not_exists (#lockNumber))',
        ExpressionAttributeNames: {
          '#clientId': 'clientId',
          '#templateStatus': 'templateStatus',
          '#templateType': 'templateType',
          '#updatedAt': 'updatedAt',
          '#updatedBy': 'updatedBy',
          '#proofingEnabled': 'proofingEnabled',
          '#supplierReferences': 'supplierReferences',
          '#lockNumber': 'lockNumber',
        },
        ExpressionAttributeValues: {
          ':condition_1_templateStatus': 'PENDING_PROOF_REQUEST',
          ':condition_2_templateType': 'LETTER',
          ':condition_3_clientId': clientId,
          ':condition_4_proofingEnabled': true,
          ':condition_5_1_lockNumber': 0,
          ':lockNumber': 1,
          ':templateStatus': 'WAITING_FOR_PROOF',
          ':updatedAt': '2024-12-27T00:00:00.000Z',
          ':updatedBy': `INTERNAL_USER#${internalUserId}`,
          ':supplierReferences': {},
        },
        Key: { id: 'template-id', owner: ownerWithClientPrefix },
        ReturnValues: 'ALL_NEW',
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        TableName: 'templates',
        UpdateExpression:
          'SET #templateStatus = :templateStatus, #updatedAt = :updatedAt, #updatedBy = :updatedBy, #supplierReferences = if_not_exists(#supplierReferences, :supplierReferences) ADD #lockNumber :lockNumber',
      });
    });

    it('returns 404 error response when conditional check fails due to template not existing', async () => {
      const { templateRepository, mocks } = setup();

      const err = new ConditionalCheckFailedException({
        message: 'condition check failed',
        $metadata: {},
      });

      mocks.ddbDocClient.on(UpdateCommand).rejectsOnce(err);

      const result = await templateRepository.proofRequestUpdate(
        'template-id',
        user,
        0
      );

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 404,
            description: 'Template not found',
          },
        },
      });
    });

    it('returns 409 error response when conditional check fails when lock numbers are different', async () => {
      const { templateRepository, mocks } = setup();

      const err = new ConditionalCheckFailedException({
        message: 'condition check failed',
        $metadata: {},
        Item: {
          templateStatus: { S: 'PENDING_UPLOAD' },
          lockNumber: { N: '1' },
        },
      });

      mocks.ddbDocClient.on(UpdateCommand).rejectsOnce(err);

      const result = await templateRepository.proofRequestUpdate(
        'template-id',
        user,
        0
      );

      expect(result).toEqual({
        error: {
          actualError: err,
          errorMeta: {
            code: 409,
            description:
              'Lock number mismatch - Template has been modified since last read',
          },
        },
      });
    });

    it('returns 400 error response when conditional check fails, but item exists, with a status other than DELETED or PENDING_PROOF_REQUEST', async () => {
      const { templateRepository, mocks } = setup();

      const err = new ConditionalCheckFailedException({
        message: 'condition check failed',
        $metadata: {},
        Item: {
          templateStatus: { S: 'PENDING_UPLOAD' },
          lockNumber: { N: '0' },
        },
      });

      mocks.ddbDocClient.on(UpdateCommand).rejectsOnce(err);

      const result = await templateRepository.proofRequestUpdate(
        'template-id',
        user,
        0
      );

      expect(result).toEqual({
        error: {
          actualError: err,
          errorMeta: {
            code: 400,
            description: 'Template cannot be proofed',
          },
        },
      });
    });

    it('returns 500 error response when update fails for reason other than conditional check', async () => {
      const { templateRepository, mocks } = setup();

      const err = new Error('!');

      mocks.ddbDocClient.on(UpdateCommand).rejectsOnce(err);

      const result = await templateRepository.proofRequestUpdate(
        'template-id',
        user,
        0
      );

      expect(result).toEqual({
        error: {
          actualError: err,
          errorMeta: {
            code: 500,
            description: 'Failed to update template',
          },
        },
      });
    });
  });
});
