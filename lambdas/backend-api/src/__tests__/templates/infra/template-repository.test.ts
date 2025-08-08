import 'aws-sdk-client-mock-jest';
import { randomUUID } from 'node:crypto';
import {
  BatchGetCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import {
  EmailProperties,
  LetterProperties,
  NhsAppProperties,
  SmsProperties,
  ValidatedCreateUpdateTemplate,
} from 'nhs-notify-backend-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { TemplateRepository } from '../../../templates/infra';
import { marshall } from '@aws-sdk/util-dynamodb';
import { DatabaseTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock('nhs-notify-web-template-management-utils/logger');
jest.mock('node:crypto');

const templateId = 'abc-def-ghi-jkl-123';
const templatesTableName = 'templates';

const setup = (enableProofing = false) => {
  const ddbDocClient = mockClient(DynamoDBDocumentClient);

  const templateRepository = new TemplateRepository(
    ddbDocClient as unknown as DynamoDBDocumentClient,
    templatesTableName,
    enableProofing
  );

  return { templateRepository, mocks: { ddbDocClient } };
};

const userId = 'user-id';
const clientId = 'client-id';
const clientOwner = `CLIENT#${clientId}`;
const user = { userId, clientId };

const emailProperties: EmailProperties = {
  message: 'message',
  subject: 'pickles',
  templateType: 'EMAIL',
};

const smsProperties: SmsProperties = {
  message: 'message',
  templateType: 'SMS',
};

const nhsAppProperties: NhsAppProperties = {
  message: 'message',
  templateType: 'NHS_APP',
};

const letterProperties: LetterProperties = {
  templateType: 'LETTER',
  letterType: 'x0',
  language: 'en',
  files: {
    pdfTemplate: {
      fileName: 'template.pdf',
      currentVersion: 'a',
      virusScanStatus: 'PENDING',
    },
    testDataCsv: {
      fileName: 'test.csv',
      currentVersion: 'a',
      virusScanStatus: 'PENDING',
    },
  },
};

const createTemplateProperties = { name: 'name' };

const updateTemplateProperties = {
  ...createTemplateProperties,
  templateStatus: 'NOT_YET_SUBMITTED' as const,
};

const databaseTemplateProperties = {
  ...updateTemplateProperties,
  id: 'abc-def-ghi-jkl-123',
  owner: `CLIENT#${clientId}`,
  version: 1,
  createdAt: '2024-12-27T00:00:00.000Z',
  updatedAt: '2024-12-27T00:00:00.000Z',
  updatedBy: userId,
  clientId,
  createdBy: userId,
};

const emailTemplate: DatabaseTemplate = {
  ...emailProperties,
  ...databaseTemplateProperties,
};

const smsTemplate: DatabaseTemplate = {
  ...smsProperties,
  ...databaseTemplateProperties,
};

const nhsAppTemplate: DatabaseTemplate = {
  ...nhsAppProperties,
  ...databaseTemplateProperties,
};

const letterTemplate: DatabaseTemplate = {
  ...letterProperties,
  ...databaseTemplateProperties,
};

describe('templateRepository', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2024, 11, 27));
  });

  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(randomUUID).mockReturnValue(templateId);
    jest.mocked(logger).child.mockReturnThis();
  });

  describe('get', () => {
    test('should return not found error when no items are found', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient.on(BatchGetCommand).resolves({
        Responses: { [templatesTableName]: [] },
        UnprocessedKeys: {},
      });

      const response = await templateRepository.get('id', user);

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(BatchGetCommand, {
        RequestItems: {
          templates: {
            Keys: [
              { id: 'id', owner: userId },
              { id: 'id', owner: clientOwner },
            ],
          },
        },
      });

      expect(response).toEqual({
        error: { errorMeta: { code: 404, description: 'Template not found' } },
      });
    });

    test('should return not found error when Responses is undefined', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient.on(BatchGetCommand).resolves({
        UnprocessedKeys: {},
      });

      const response = await templateRepository.get('id', {
        userId: 'user',
        clientId: 'client',
      });

      expect(response).toEqual({
        error: { errorMeta: { code: 404, description: 'Template not found' } },
      });
    });

    test('should return not found error when template status is DELETED', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient.on(BatchGetCommand).resolves({
        Responses: {
          [templatesTableName]: [
            {
              id: 'abc-def-ghi-jkl-123',
              owner: 'userid',
              templateStatus: 'DELETED',
            },
          ],
        },
        UnprocessedKeys: {},
      });

      const response = await templateRepository.get('abc-def-ghi-jkl-123', {
        userId: 'userid',
        clientId: 'clientid',
      });

      expect(response).toEqual({
        error: { errorMeta: { code: 404, description: 'Template not found' } },
      });
    });

    test('should return error when unexpected error occurs', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient
        .on(BatchGetCommand)
        .rejects(new Error('InternalServerError'));

      const response = await templateRepository.get('abc-def-ghi-jkl-123', {
        userId: 'userid',
        clientId: 'clientid',
      });

      expect(response).toEqual({
        error: {
          actualError: new Error('InternalServerError'),
          errorMeta: {
            code: 500,
            description: 'Failed to get template',
          },
        },
      });
    });

    test('should return error when UnprocessedKeys are returned', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient.on(BatchGetCommand).resolves({
        Responses: {
          [templatesTableName]: [],
        },
        UnprocessedKeys: {
          [templatesTableName]: {
            Keys: [
              {
                id: 'abc-def-ghi-jkl-123',
                owner: userId,
              },
            ],
          },
        },
      });

      const response = await templateRepository.get('abc-def-ghi-jkl-123', {
        userId: 'userid',
        clientId: 'clientid',
      });

      expect(response).toEqual({
        error: {
          actualError: new Error('Partial failure of batch get templates'),
          errorMeta: {
            code: 500,
            description: 'Failed to get template',
          },
        },
      });
    });

    test('should return error when more than one template is returned', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient.on(BatchGetCommand).resolves({
        Responses: {
          [templatesTableName]: [
            {
              id: 'abc-def-ghi-jkl-123',
              owner: 'userid',
              templateStatus: 'NOT_YET_SUBMITTED',
            },
            {
              id: 'abc-def-ghi-jkl-123',
              owner: 'CLIENT#clientid',
              templateStatus: 'NOT_YET_SUBMITTED',
            },
          ],
        },
        UnprocessedKeys: {},
      });

      const response = await templateRepository.get('abc-def-ghi-jkl-123', {
        userId: 'userid',
        clientId: 'clientid',
      });

      expect(response).toEqual({
        error: {
          actualError: new Error(
            'Unexpectedly found both a client owned and a user owned template'
          ),
          errorMeta: {
            code: 500,
            description: 'Failed to get template',
          },
        },
      });
    });

    test('should return template', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient.on(BatchGetCommand).resolves({
        Responses: {
          [templatesTableName]: [emailTemplate],
        },
        UnprocessedKeys: {},
      });

      const response = await templateRepository.get('abc-def-ghi-jkl-123', {
        userId: emailTemplate.owner,
        clientId: emailTemplate.clientId!,
      });

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(BatchGetCommand, {
        RequestItems: {
          templates: {
            Keys: [
              { id: 'abc-def-ghi-jkl-123', owner: emailTemplate.owner },
              {
                id: 'abc-def-ghi-jkl-123',
                owner: `CLIENT#${emailTemplate.clientId}`,
              },
            ],
          },
        },
      });

      expect(response).toEqual({ data: emailTemplate });
    });
  });

  describe('list', () => {
    test('should return an empty array when no items', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient.on(QueryCommand).resolves({ Items: undefined });

      const response = await templateRepository.list({
        userId: 'userid',
        clientId: 'clientid',
      });

      expect(response).toEqual({ data: [] });
    });

    test('should error when unexpected error occurs', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient
        .on(QueryCommand)
        .rejects(new Error('InternalServerError'));

      const response = await templateRepository.list({
        userId: 'userid',
        clientId: 'clientid',
      });

      expect(response).toEqual({
        error: {
          actualError: new Error('InternalServerError'),
          errorMeta: {
            code: 500,
            description: 'Failed to list templates',
          },
        },
      });
    });

    test('should return templates', async () => {
      const { templateRepository, mocks } = setup();

      const clientOwnedTemplate = {
        ...letterTemplate,
        id: 'client-owned',
        owner: 'CLIENT#client',
      };

      mocks.ddbDocClient
        .on(QueryCommand)
        .resolvesOnce({
          Items: [emailTemplate, smsTemplate, nhsAppTemplate, letterTemplate],
        })
        .resolvesOnce({
          Items: [clientOwnedTemplate],
        });

      const response = await templateRepository.list(user);

      expect(mocks.ddbDocClient).toHaveReceivedCommandTimes(QueryCommand, 2);
      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(QueryCommand, {
        ExclusiveStartKey: undefined,
        ExpressionAttributeNames: {
          '#owner': 'owner',
          '#status': 'templateStatus',
        },
        ExpressionAttributeValues: {
          ':deletedStatus': 'DELETED',
          ':owner': clientOwner,
        },
        FilterExpression: '#status <> :deletedStatus',
        KeyConditionExpression: '#owner = :owner',
        TableName: 'templates',
      });
      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(QueryCommand, {
        ExclusiveStartKey: undefined,
        ExpressionAttributeNames: {
          '#owner': 'owner',
          '#status': 'templateStatus',
        },
        ExpressionAttributeValues: {
          ':deletedStatus': 'DELETED',
          ':owner': userId,
        },
        FilterExpression: '#status <> :deletedStatus',
        KeyConditionExpression: '#owner = :owner',
        TableName: 'templates',
      });

      expect(response).toEqual({
        data: [
          emailTemplate,
          smsTemplate,
          nhsAppTemplate,
          letterTemplate,
          clientOwnedTemplate,
        ],
      });
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
        user,
        true
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

    test.each([
      emailProperties,
      smsProperties,
      nhsAppProperties,
      letterProperties,
    ])(
      'should create template of type $templateType',
      async (channelProperties) => {
        const { templateRepository, mocks } = setup();

        mocks.ddbDocClient
          .on(PutCommand, {
            TableName: templatesTableName,
            Item: { ...channelProperties, ...databaseTemplateProperties },
          })
          .resolves({});

        const response = await templateRepository.create(
          { ...channelProperties, ...createTemplateProperties },
          user,
          true
        );

        expect(response).toEqual({
          data: { ...channelProperties, ...databaseTemplateProperties },
        });
      }
    );

    test('should create template of type $templateType with campaignId', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient
        .on(PutCommand, {
          TableName: templatesTableName,
          Item: {
            ...emailProperties,
            ...databaseTemplateProperties,
            campaignId: 'campaignId',
          },
        })
        .resolves({});

      const response = await templateRepository.create(
        { ...emailProperties, ...createTemplateProperties },
        user,
        true,
        'NOT_YET_SUBMITTED',
        'campaignId'
      );

      expect(response).toEqual({
        data: {
          ...emailProperties,
          ...databaseTemplateProperties,
          campaignId: 'campaignId',
        },
      });
    });

    test('created user owned template', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient
        .on(PutCommand, {
          TableName: templatesTableName,
          Item: {
            ...emailProperties,
            ...databaseTemplateProperties,
            campaignId: 'campaignId',
          },
        })
        .resolves({});

      const response = await templateRepository.create(
        { ...emailProperties, ...createTemplateProperties },
        user,
        false,
        'NOT_YET_SUBMITTED',
        'campaignId'
      );

      expect(response).toEqual({
        data: {
          ...emailProperties,
          ...databaseTemplateProperties,
          campaignId: 'campaignId',
          owner: userId,
        },
      });
    });
  });

  describe('update', () => {
    test.each([
      { Item: undefined, code: 404, message: 'Template not found' },
      {
        testName:
          'Fails when user tries to change templateType from SMS to EMAIL',
        Item: {
          templateType: { S: 'SMS' },
          templateStatus: { S: 'NOT_YET_SUBMITTED' },
        },
        code: 400,
        message: 'Can not change template templateType',
        details: { templateType: 'Expected SMS but got EMAIL' },
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
      async ({ Item, code, message, details }) => {
        const { templateRepository, mocks } = setup();

        const error = new ConditionalCheckFailedException({
          message: 'mocked',
          $metadata: { httpStatusCode: 400 },
          Item,
        });

        mocks.ddbDocClient
          .on(QueryCommand)
          .resolves({
            Items: [{ id: 'abc-def-ghi-jkl-123', owner: clientOwner }],
          })
          .on(UpdateCommand)
          .rejects(error);

        const response = await templateRepository.update(
          'abc-def-ghi-jkl-123',
          {
            name: 'name',
            message: 'message',
            subject: 'subject',
            templateType: 'EMAIL',
          },
          user,
          'NOT_YET_SUBMITTED'
        );

        expect(response).toEqual({
          error: {
            actualError: error,
            errorMeta: {
              code,
              description: message,
              details,
            },
          },
        });
      }
    );

    test('returns 404 response when GSI query cannot find owned template', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient.on(QueryCommand).resolves({
        Items: [{ id: templateId, owner: 'someone-else' }],
      });

      const response = await templateRepository.update(
        'template-id',
        {
          name: 'name',
          message: 'message',
          subject: 'subject',
          templateType: 'EMAIL',
        },
        user,
        'NOT_YET_SUBMITTED'
      );

      expect(response).toEqual({
        error: {
          errorMeta: {
            code: 404,
            description: 'Template not found',
          },
        },
      });
    });

    test('should return error when, an unexpected error occurs', async () => {
      const { templateRepository, mocks } = setup();

      const error = new Error('mocked');

      mocks.ddbDocClient
        .on(QueryCommand)
        .resolves({
          Items: [{ id: 'abc-def-ghi-jkl-123', owner: clientOwner }],
        })
        .on(UpdateCommand)
        .rejects(error);

      const response = await templateRepository.update(
        'abc-def-ghi-jkl-123',
        {
          name: 'name',
          message: 'message',
          subject: 'subject',
          templateType: 'EMAIL',
        },
        user,
        'NOT_YET_SUBMITTED'
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

    test.each([
      emailProperties,
      smsProperties,
      nhsAppProperties,
      letterProperties,
    ])(
      'should update template of type $templateType with name',
      async (channelProperties) => {
        const { templateRepository, mocks } = setup();

        const updatedTemplate: ValidatedCreateUpdateTemplate = {
          ...channelProperties,
          ...updateTemplateProperties,
          name: 'updated-name',
        };

        mocks.ddbDocClient
          .on(QueryCommand)
          .resolves({
            Items: [{ id: 'abc-def-ghi-jkl-123', owner: clientOwner }],
          })
          .on(UpdateCommand, {
            TableName: templatesTableName,
            Key: { id: 'abc-def-ghi-jkl-123', owner: clientOwner },
          })
          .resolves({
            Attributes: {
              ...channelProperties,
              ...databaseTemplateProperties,
              ...updatedTemplate,
            },
          });

        const response = await templateRepository.update(
          'abc-def-ghi-jkl-123',
          updatedTemplate,
          user,
          'NOT_YET_SUBMITTED'
        );

        expect(response).toEqual({
          data: {
            ...channelProperties,
            ...databaseTemplateProperties,
            ...updatedTemplate,
          },
        });
      }
    );

    test('updates a user-owned template', async () => {
      const { templateRepository, mocks } = setup();

      const updatedTemplate: ValidatedCreateUpdateTemplate = {
        ...emailProperties,
        ...updateTemplateProperties,
        name: 'updated-name',
      };

      mocks.ddbDocClient
        .on(QueryCommand)
        .resolves({
          Items: [{ id: 'abc-def-ghi-jkl-123', owner: userId }],
        })
        .on(UpdateCommand, {
          TableName: templatesTableName,
          Key: { id: 'abc-def-ghi-jkl-123', owner: userId },
        })
        .resolves({
          Attributes: {
            ...emailProperties,
            ...databaseTemplateProperties,
            ...updatedTemplate,
            owner: userId,
          },
        });

      const response = await templateRepository.update(
        'abc-def-ghi-jkl-123',
        updatedTemplate,
        user,
        'NOT_YET_SUBMITTED'
      );

      expect(response).toEqual({
        data: {
          ...emailProperties,
          ...databaseTemplateProperties,
          ...updatedTemplate,
          owner: userId,
        },
      });
    });
  });

  describe('submit', () => {
    test.each([
      {
        Item: undefined,
        code: 404,
        message: 'Template not found',
      },
      {
        testName:
          'Fails when user tries to submit template when templateStatus is SUBMITTED',
        Item: marshall({
          templateType: 'EMAIL',
          templateStatus: 'SUBMITTED',
        }),
        code: 400,
        message: 'Template with status SUBMITTED cannot be updated',
      },
      {
        testName:
          'Fails when user tries to submit template when templateStatus is PENDING_UPLOAD',
        Item: marshall({
          templateType: 'LETTER',
          templateStatus: 'PENDING_UPLOAD',
        }),
        code: 400,
        message: 'Template cannot be submitted',
      },
      {
        testName:
          'Fails when user tries to submit template when templateStatus is PENDING_VALIDATION',
        Item: marshall({
          templateType: 'LETTER',
          templateStatus: 'PENDING_VALIDATION',
        }),
        code: 400,
        message: 'Template cannot be submitted',
      },
      {
        testName:
          'Fails when user tries to submit template when templateStatus is DELETED',
        Item: marshall({
          templateType: 'EMAIL',
          templateStatus: 'DELETED',
        }),
        code: 404,
        message: 'Template not found',
      },
      {
        testName:
          'Fails when user tries to submit a letter template when any virusScanStatus is not PASSED',
        Item: marshall({
          templateType: 'LETTER',
          templateStatus: 'NOT_YET_SUBMITTED',
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
      },
    ])('submit: $testName', async ({ Item, code, message }) => {
      const { templateRepository, mocks } = setup();

      const error = new ConditionalCheckFailedException({
        message: 'mocked',
        $metadata: { httpStatusCode: 400 },
        Item,
      });

      mocks.ddbDocClient
        .on(QueryCommand)
        .resolves({
          Items: [{ id: 'abc-def-ghi-jkl-123', owner: clientOwner }],
        })
        .on(UpdateCommand)
        .rejects(error);

      const response = await templateRepository.submit(
        'abc-def-ghi-jkl-123',
        user
      );

      expect(response).toEqual({
        error: {
          actualError: error,
          errorMeta: {
            code,
            description: message,
          },
        },
      });
    });

    test('returns 404 response when GSI query cannot find owned template', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient.on(QueryCommand).resolves({
        Items: [{ id: templateId, owner: 'someone-else' }],
      });

      const response = await templateRepository.submit('template-id', user);

      expect(response).toEqual({
        error: {
          errorMeta: {
            code: 404,
            description: 'Template not found',
          },
        },
      });
    });

    test('should return error when, an unexpected error occurs', async () => {
      const { templateRepository, mocks } = setup();

      const error = new Error('mocked');

      mocks.ddbDocClient
        .on(QueryCommand)
        .resolves({
          Items: [{ id: 'abc-def-ghi-jkl-123', owner: clientOwner }],
        })
        .on(UpdateCommand)
        .rejects(error);

      const response = await templateRepository.submit(
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

    test('should update templateStatus to SUBMITTED', async () => {
      const { templateRepository, mocks } = setup();
      const id = 'abc-def-ghi-jkl-123';

      const databaseTemplate: DatabaseTemplate = {
        id,
        owner: clientOwner,
        version: 1,
        name: 'updated-name',
        message: 'updated-message',
        templateStatus: 'SUBMITTED',
        templateType: 'NHS_APP',
        updatedAt: 'now',
        createdAt: 'yesterday',
      };

      mocks.ddbDocClient
        .on(QueryCommand)
        .resolves({
          Items: [{ id, owner: clientOwner }],
        })
        .on(UpdateCommand, {
          TableName: templatesTableName,
          Key: { id, owner: clientOwner },
        })
        .resolves({ Attributes: databaseTemplate });

      const response = await templateRepository.submit(id, user);

      expect(response).toEqual({
        data: databaseTemplate,
      });
    });

    test('should update templateStatus to SUBMITTED when template is user-owned', async () => {
      const { templateRepository, mocks } = setup();
      const id = 'abc-def-ghi-jkl-123';

      const databaseTemplate: DatabaseTemplate = {
        id,
        owner: userId,
        version: 1,
        name: 'updated-name',
        message: 'updated-message',
        templateStatus: 'SUBMITTED',
        templateType: 'NHS_APP',
        updatedAt: 'now',
        createdAt: 'yesterday',
      };

      mocks.ddbDocClient
        .on(QueryCommand)
        .resolves({
          Items: [{ id, owner: userId }],
        })
        .on(UpdateCommand, {
          TableName: templatesTableName,
          Key: { id, owner: userId },
        })
        .resolves({ Attributes: databaseTemplate });

      const response = await templateRepository.submit(id, user);

      expect(response).toEqual({
        data: databaseTemplate,
      });
    });
  });

  describe('delete', () => {
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

        mocks.ddbDocClient
          .on(QueryCommand)
          .resolves({
            Items: [{ id: 'abc-def-ghi-jkl-123', owner: clientOwner }],
          })
          .on(UpdateCommand)
          .rejects(error);

        const response = await templateRepository.delete(
          'abc-def-ghi-jkl-123',
          user
        );

        expect(response).toEqual({
          error: {
            actualError: error,
            errorMeta: {
              code,
              description: message,
            },
          },
        });
      }
    );

    test('returns 404 response when GSI query cannot find owned template', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient.on(QueryCommand).resolves({
        Items: [{ id: templateId, owner: 'someone-else' }],
      });

      const response = await templateRepository.delete('template-id', user);

      expect(response).toEqual({
        error: {
          errorMeta: {
            code: 404,
            description: 'Template not found',
          },
        },
      });
    });

    test('should return error when, an unexpected error occurs', async () => {
      const { templateRepository, mocks } = setup();

      const error = new Error('mocked');

      mocks.ddbDocClient
        .on(QueryCommand)
        .resolves({
          Items: [{ id: 'abc-def-ghi-jkl-123', owner: clientOwner }],
        })
        .on(UpdateCommand)
        .rejects(error);

      const response = await templateRepository.delete(
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

    test('should update templateStatus to DELETED', async () => {
      const { templateRepository, mocks } = setup();
      const id = 'abc-def-ghi-jkl-123';

      const databaseTemplate: DatabaseTemplate = {
        id,
        owner: clientOwner,
        version: 1,
        name: 'updated-name',
        message: 'updated-message',
        templateStatus: 'DELETED',
        templateType: 'NHS_APP',
        updatedAt: 'now',
        createdAt: 'yesterday',
      };

      mocks.ddbDocClient
        .on(QueryCommand)
        .resolves({
          Items: [{ id: 'abc-def-ghi-jkl-123', owner: clientOwner }],
        })
        .on(UpdateCommand, {
          TableName: templatesTableName,
          Key: { id: 'abc-def-ghi-jkl-123', owner: clientOwner },
        })
        .resolves({
          Attributes: {
            ...databaseTemplate,
          },
        });

      const response = await templateRepository.delete(
        'abc-def-ghi-jkl-123',
        user
      );

      expect(response).toEqual({
        data: databaseTemplate,
      });
    });

    test('should update templateStatus to DELETED when template is user-owned', async () => {
      const { templateRepository, mocks } = setup();
      const id = 'abc-def-ghi-jkl-123';

      const databaseTemplate: DatabaseTemplate = {
        id,
        owner: userId,
        version: 1,
        name: 'updated-name',
        message: 'updated-message',
        templateStatus: 'DELETED',
        templateType: 'NHS_APP',
        updatedAt: 'now',
        createdAt: 'yesterday',
      };

      mocks.ddbDocClient
        .on(QueryCommand)
        .resolves({
          Items: [{ id: 'abc-def-ghi-jkl-123', owner: userId }],
        })
        .on(UpdateCommand, {
          TableName: templatesTableName,
          Key: { id: 'abc-def-ghi-jkl-123', owner: userId },
        })
        .resolves({
          Attributes: {
            ...databaseTemplate,
          },
        });

      const response = await templateRepository.delete(
        'abc-def-ghi-jkl-123',
        user
      );

      expect(response).toEqual({
        data: databaseTemplate,
      });
    });
  });

  describe('updateStatus', () => {
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

        mocks.ddbDocClient
          .on(QueryCommand)
          .resolves({
            Items: [{ id: 'abc-def-ghi-jkl-123', owner: clientOwner }],
          })
          .on(UpdateCommand)
          .rejects(error);

        const response = await templateRepository.updateStatus(
          'abc-def-ghi-jkl-123',
          user,
          'PENDING_VALIDATION'
        );

        expect(response).toEqual({
          error: {
            actualError: error,
            errorMeta: {
              code,
              description: message,
            },
          },
        });
      }
    );

    test('returns 404 response when GSI query cannot find user template', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient.on(QueryCommand).resolves({
        Items: [{ id: templateId, owner: 'someone-else' }],
      });

      const response = await templateRepository.updateStatus(
        templateId,
        user,
        'PENDING_VALIDATION'
      );

      expect(response).toEqual({
        error: {
          errorMeta: {
            code: 404,
            description: 'Template not found',
          },
        },
      });
    });

    test('should return error when, an unexpected error occurs', async () => {
      const { templateRepository, mocks } = setup();

      const error = new Error('mocked');

      mocks.ddbDocClient
        .on(QueryCommand)
        .resolves({
          Items: [{ id: 'abc-def-ghi-jkl-123', owner: clientOwner }],
        })
        .on(UpdateCommand)
        .rejects(error);

      const response = await templateRepository.updateStatus(
        'abc-def-ghi-jkl-123',
        user,
        'PENDING_VALIDATION'
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

    test('should update templateStatus to new status', async () => {
      const { templateRepository, mocks } = setup();
      const id = 'abc-def-ghi-jkl-123';

      const databaseTemplate: DatabaseTemplate = {
        id,
        owner: clientOwner,
        version: 1,
        name: 'updated-name',
        message: 'updated-message',
        templateStatus: 'PENDING_VALIDATION',
        templateType: 'NHS_APP',
        updatedAt: 'now',
        createdAt: 'yesterday',
      };

      mocks.ddbDocClient
        .on(QueryCommand)
        .resolves({
          Items: [{ id: 'abc-def-ghi-jkl-123', owner: clientOwner }],
        })
        .on(UpdateCommand, {
          TableName: templatesTableName,
          Key: { id: 'abc-def-ghi-jkl-123', owner: clientOwner },
        })
        .resolves({
          Attributes: {
            ...databaseTemplate,
          },
        });

      const response = await templateRepository.updateStatus(
        'abc-def-ghi-jkl-123',
        user,
        'PENDING_VALIDATION'
      );

      expect(response).toEqual({
        data: databaseTemplate,
      });
    });

    test('should update templateStatus to new status when template is user-owned', async () => {
      const { templateRepository, mocks } = setup();
      const id = 'abc-def-ghi-jkl-123';

      const databaseTemplate: DatabaseTemplate = {
        id,
        owner: userId,
        version: 1,
        name: 'updated-name',
        message: 'updated-message',
        templateStatus: 'PENDING_VALIDATION',
        templateType: 'NHS_APP',
        updatedAt: 'now',
        createdAt: 'yesterday',
      };

      mocks.ddbDocClient
        .on(QueryCommand)
        .resolves({
          Items: [{ id: 'abc-def-ghi-jkl-123', owner: userId }],
        })
        .on(UpdateCommand, {
          TableName: templatesTableName,
          Key: { id: 'abc-def-ghi-jkl-123', owner: userId },
        })
        .resolves({
          Attributes: {
            ...databaseTemplate,
          },
        });

      const response = await templateRepository.updateStatus(
        'abc-def-ghi-jkl-123',
        user,
        'PENDING_VALIDATION'
      );

      expect(response).toEqual({
        data: databaseTemplate,
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
        clientOwner,
        'template-id',
        'pdf-template.pdf',
        'PASSED',
        'MBA'
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'templates',
        Key: { id: 'template-id', owner: clientOwner },
        UpdateExpression:
          'SET files.proofs.#fileName = :virusScanResult, updatedAt = :updatedAt',
        ConditionExpression:
          'attribute_not_exists(files.proofs.#fileName) and not templateStatus in (:templateStatusDeleted, :templateStatusSubmitted)',
        ExpressionAttributeNames: {
          '#fileName': 'pdf-template.pdf',
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
        },
      });

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'templates',
        Key: { id: 'template-id', owner: clientOwner },
        UpdateExpression:
          'SET templateStatus = :templateStatusProofAvailable, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':templateStatusWaitingForProof': 'WAITING_FOR_PROOF',
          ':templateStatusProofAvailable': 'PROOF_AVAILABLE',
          ':updatedAt': new Date().toISOString(),
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
        clientOwner,
        'template-id',
        'pdf-template.pdf',
        'FAILED',
        'MBA'
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'templates',
        Key: { id: 'template-id', owner: clientOwner },
        UpdateExpression:
          'SET files.proofs.#fileName = :virusScanResult, updatedAt = :updatedAt',
        ConditionExpression:
          'attribute_not_exists(files.proofs.#fileName) and not templateStatus in (:templateStatusDeleted, :templateStatusSubmitted)',
        ExpressionAttributeNames: {
          '#fileName': 'pdf-template.pdf',
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
          clientOwner,
          'template-id',
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
          clientOwner,
          'template-id',
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
          clientOwner,
          'template-id',
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
          clientOwner,
          'template-id',
          'pdf-template',
          'PASSED',
          'MBA'
        )
      ).rejects.toThrow('Something went wrong');
    });
  });

  describe('getOwner', () => {
    it('gets owner', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient.on(QueryCommand).resolves({
        Items: [
          {
            owner: 'template-owner',
          },
        ],
      });

      const owner = await templateRepository.getOwner('template-id');

      expect(owner).toEqual('template-owner');
    });

    it('errors when owner cannot be found', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient.on(QueryCommand).resolves({
        Items: [],
      });

      await expect(() =>
        templateRepository.getOwner('template-id')
      ).rejects.toThrow('Could not identify item by id template-id');
    });
  });

  describe('setLetterFileVirusScanStatusForUpload', () => {
    it('updates the virusScanStatus on the pdfTemplate field when the status is PASSED', async () => {
      const { templateRepository, mocks } = setup();

      await templateRepository.setLetterFileVirusScanStatusForUpload(
        { owner: clientOwner, id: 'template-id' },
        'pdf-template',
        'pdf-version-id',
        'PASSED'
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'templates',
        Key: { id: 'template-id', owner: clientOwner },
        UpdateExpression:
          'SET #files.#file.#scanStatus = :scanStatus , #updatedAt = :updatedAt',
        ConditionExpression:
          '#files.#file.#version = :version and not #templateStatus in (:templateStatusDeleted, :templateStatusSubmitted)',
        ExpressionAttributeNames: {
          '#file': 'pdfTemplate',
          '#files': 'files',
          '#scanStatus': 'virusScanStatus',
          '#templateStatus': 'templateStatus',
          '#updatedAt': 'updatedAt',
          '#version': 'currentVersion',
        },
        ExpressionAttributeValues: {
          ':scanStatus': 'PASSED',
          ':templateStatusDeleted': 'DELETED',
          ':templateStatusSubmitted': 'SUBMITTED',
          ':updatedAt': '2024-12-27T00:00:00.000Z',
          ':version': 'pdf-version-id',
        },
      });
    });

    it('updates the virusScanStatus on the testDataCsv field when the status is PASSED', async () => {
      const { templateRepository, mocks } = setup();

      await templateRepository.setLetterFileVirusScanStatusForUpload(
        { owner: clientOwner, id: 'template-id' },
        'test-data',
        'csv-version-id',
        'PASSED'
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'templates',
        Key: { id: 'template-id', owner: clientOwner },
        UpdateExpression:
          'SET #files.#file.#scanStatus = :scanStatus , #updatedAt = :updatedAt',
        ConditionExpression:
          '#files.#file.#version = :version and not #templateStatus in (:templateStatusDeleted, :templateStatusSubmitted)',
        ExpressionAttributeNames: {
          '#file': 'testDataCsv',
          '#files': 'files',
          '#scanStatus': 'virusScanStatus',
          '#templateStatus': 'templateStatus',
          '#updatedAt': 'updatedAt',
          '#version': 'currentVersion',
        },
        ExpressionAttributeValues: {
          ':scanStatus': 'PASSED',
          ':templateStatusDeleted': 'DELETED',
          ':templateStatusSubmitted': 'SUBMITTED',
          ':updatedAt': '2024-12-27T00:00:00.000Z',
          ':version': 'csv-version-id',
        },
      });
    });

    it('updates the virusScanStatus on the pdfTemplate field and the overall template status when the status is FAILED', async () => {
      const { templateRepository, mocks } = setup();

      await templateRepository.setLetterFileVirusScanStatusForUpload(
        { owner: clientOwner, id: 'template-id' },
        'pdf-template',
        'pdf-version-id',
        'FAILED'
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'templates',
        Key: { id: 'template-id', owner: clientOwner },
        UpdateExpression:
          'SET #files.#file.#scanStatus = :scanStatus , #updatedAt = :updatedAt , #templateStatus = :templateStatusFailed',
        ConditionExpression:
          '#files.#file.#version = :version and not #templateStatus in (:templateStatusDeleted, :templateStatusSubmitted)',
        ExpressionAttributeNames: {
          '#file': 'pdfTemplate',
          '#files': 'files',
          '#scanStatus': 'virusScanStatus',
          '#templateStatus': 'templateStatus',
          '#updatedAt': 'updatedAt',
          '#version': 'currentVersion',
        },
        ExpressionAttributeValues: {
          ':scanStatus': 'FAILED',
          ':templateStatusDeleted': 'DELETED',
          ':templateStatusFailed': 'VIRUS_SCAN_FAILED',
          ':templateStatusSubmitted': 'SUBMITTED',
          ':updatedAt': '2024-12-27T00:00:00.000Z',
          ':version': 'pdf-version-id',
        },
      });
    });

    it('updates the virusScanStatus on the testDataCsv field and the overall template status when the status is FAILED', async () => {
      const { templateRepository, mocks } = setup();

      await templateRepository.setLetterFileVirusScanStatusForUpload(
        { owner: clientOwner, id: 'template-id' },
        'test-data',
        'csv-version-id',
        'FAILED'
      );

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'templates',
        Key: { id: 'template-id', owner: clientOwner },
        UpdateExpression:
          'SET #files.#file.#scanStatus = :scanStatus , #updatedAt = :updatedAt , #templateStatus = :templateStatusFailed',
        ConditionExpression:
          '#files.#file.#version = :version and not #templateStatus in (:templateStatusDeleted, :templateStatusSubmitted)',
        ExpressionAttributeNames: {
          '#file': 'testDataCsv',
          '#files': 'files',
          '#scanStatus': 'virusScanStatus',
          '#templateStatus': 'templateStatus',
          '#updatedAt': 'updatedAt',
          '#version': 'currentVersion',
        },
        ExpressionAttributeValues: {
          ':scanStatus': 'FAILED',
          ':templateStatusDeleted': 'DELETED',
          ':templateStatusFailed': 'VIRUS_SCAN_FAILED',
          ':templateStatusSubmitted': 'SUBMITTED',
          ':updatedAt': '2024-12-27T00:00:00.000Z',
          ':version': 'csv-version-id',
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
          { owner: clientOwner, id: 'template-id' },
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
          { owner: clientOwner, id: 'template-id' },
          'test-data',
          'csv-version-id',
          'FAILED'
        )
      ).rejects.toThrow('Something went wrong');
    });
  });

  describe('setLetterValidationResult', () => {
    describe('when proofing flag is enabled', () => {
      const proofingEnabled = true;

      const { templateRepository, mocks } = setup(proofingEnabled);

      it('should update the templateStatus to PENDING_PROOF_REQUEST, personalisationParameters and csvHeader when template is valid', async () => {
        await templateRepository.setLetterValidationResult(
          { owner: clientOwner, id: 'template-id' },
          'file-version-id',
          true,
          ['personalisation', 'parameters'],
          ['csv', 'headers'],
          proofingEnabled
        );

        expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
          TableName: 'templates',
          Key: { id: 'template-id', owner: clientOwner },
          UpdateExpression:
            'SET #templateStatus = :templateStatus , #updatedAt = :updatedAt , #personalisationParameters = :personalisationParameters , #testDataCsvHeaders = :testDataCsvHeaders',
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
          },
          ExpressionAttributeValues: {
            ':testDataCsvHeaders': ['csv', 'headers'],
            ':personalisationParameters': ['personalisation', 'parameters'],
            ':templateStatus': 'PENDING_PROOF_REQUEST',
            ':templateStatusDeleted': 'DELETED',
            ':templateStatusSubmitted': 'SUBMITTED',
            ':updatedAt': '2024-12-27T00:00:00.000Z',
            ':version': 'file-version-id',
          },
        });
      });

      it('should update the templateStatus to VALIDATION_FAILED when template is not valid', async () => {
        await templateRepository.setLetterValidationResult(
          { owner: clientOwner, id: 'template-id' },
          'file-version-id',
          false,
          [],
          [],
          proofingEnabled
        );

        expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
          TableName: 'templates',
          Key: { id: 'template-id', owner: clientOwner },
          UpdateExpression:
            'SET #templateStatus = :templateStatus , #updatedAt = :updatedAt',
          ConditionExpression:
            '#files.#file.#version = :version and not #templateStatus in (:templateStatusDeleted, :templateStatusSubmitted)',
          ExpressionAttributeNames: {
            '#file': 'pdfTemplate',
            '#files': 'files',
            '#templateStatus': 'templateStatus',
            '#updatedAt': 'updatedAt',
            '#version': 'currentVersion',
          },
          ExpressionAttributeValues: {
            ':templateStatus': 'VALIDATION_FAILED',
            ':templateStatusDeleted': 'DELETED',
            ':templateStatusSubmitted': 'SUBMITTED',
            ':updatedAt': '2024-12-27T00:00:00.000Z',
            ':version': 'file-version-id',
          },
        });
      });
    });

    describe('when proofing flag is disabled', () => {
      test.each([
        {
          globalProofing: false,
          clientProofing: false,
        },
        {
          globalProofing: true,
          clientProofing: false,
        },
        {
          globalProofing: false,
          clientProofing: true,
        },
      ])(
        'updates the templateStatus to NOT_YET_SUBMITTED when global proofing is $globalProofing and client proofing is $clientProofing',
        async ({ clientProofing, globalProofing }) => {
          const { templateRepository, mocks } = setup(globalProofing);

          await templateRepository.setLetterValidationResult(
            { owner: clientOwner, id: 'template-id' },
            'file-version-id',
            true,
            ['personalisation', 'parameters'],
            ['csv', 'headers'],
            clientProofing
          );

          expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
            TableName: 'templates',
            Key: { id: 'template-id', owner: clientOwner },
            UpdateExpression:
              'SET #templateStatus = :templateStatus , #updatedAt = :updatedAt , #personalisationParameters = :personalisationParameters , #testDataCsvHeaders = :testDataCsvHeaders',
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
            },
            ExpressionAttributeValues: {
              ':testDataCsvHeaders': ['csv', 'headers'],
              ':personalisationParameters': ['personalisation', 'parameters'],
              ':templateStatus': 'NOT_YET_SUBMITTED',
              ':templateStatusDeleted': 'DELETED',
              ':templateStatusSubmitted': 'SUBMITTED',
              ':updatedAt': '2024-12-27T00:00:00.000Z',
              ':version': 'file-version-id',
            },
          });
        }
      );

      it('updates the templateStatus to VALIDATION_FAILED if not valid', async () => {
        const { templateRepository, mocks } = setup(false);

        await templateRepository.setLetterValidationResult(
          { owner: clientOwner, id: 'template-id' },
          'file-version-id',
          false,
          [],
          [],
          false
        );

        expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
          TableName: 'templates',
          Key: { id: 'template-id', owner: clientOwner },
          UpdateExpression:
            'SET #templateStatus = :templateStatus , #updatedAt = :updatedAt',
          ConditionExpression:
            '#files.#file.#version = :version and not #templateStatus in (:templateStatusDeleted, :templateStatusSubmitted)',
          ExpressionAttributeNames: {
            '#file': 'pdfTemplate',
            '#files': 'files',
            '#templateStatus': 'templateStatus',
            '#updatedAt': 'updatedAt',
            '#version': 'currentVersion',
          },
          ExpressionAttributeValues: {
            ':templateStatus': 'VALIDATION_FAILED',
            ':templateStatusDeleted': 'DELETED',
            ':templateStatusSubmitted': 'SUBMITTED',
            ':updatedAt': '2024-12-27T00:00:00.000Z',
            ':version': 'file-version-id',
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
          { owner: clientOwner, id: 'template-id' },
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
          { owner: 'template-owner', id: clientOwner },
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

      mocks.ddbDocClient
        .on(QueryCommand)
        .resolvesOnce({
          Items: [{ id: 'template-id', owner: clientOwner }],
        })
        .on(UpdateCommand)
        .resolvesOnce({
          Attributes: {
            // complete template
            id: 'template-id',
          },
        });

      const result = await templateRepository.proofRequestUpdate(
        'template-id',
        user
      );

      expect(result).toEqual({ data: { id: 'template-id' } });

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        ConditionExpression:
          '#templateStatus = :condition_1_templateStatus AND #templateType = :condition_2_templateType AND #clientId = :condition_3_clientId AND attribute_exists (#id) AND #proofingEnabled = :condition_5_proofingEnabled',
        ExpressionAttributeNames: {
          '#id': 'id',
          '#clientId': 'clientId',
          '#templateStatus': 'templateStatus',
          '#templateType': 'templateType',
          '#updatedAt': 'updatedAt',
          '#proofingEnabled': 'proofingEnabled',
        },
        ExpressionAttributeValues: {
          ':condition_1_templateStatus': 'PENDING_PROOF_REQUEST',
          ':condition_2_templateType': 'LETTER',
          ':condition_3_clientId': clientId,
          ':condition_5_proofingEnabled': true,
          ':templateStatus': 'WAITING_FOR_PROOF',
          ':updatedAt': '2024-12-27T00:00:00.000Z',
        },
        Key: { id: 'template-id', owner: clientOwner },
        ReturnValues: 'ALL_NEW',
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        TableName: 'templates',
        UpdateExpression:
          'SET #templateStatus = :templateStatus, #updatedAt = :updatedAt',
      });
    });

    it('updates status to WAITING_FOR_PROOF when template is user-owned', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient
        .on(QueryCommand)
        .resolvesOnce({
          Items: [{ id: 'template-id', owner: userId }],
        })
        .on(UpdateCommand)
        .resolvesOnce({
          Attributes: {
            // complete template
            id: 'template-id',
          },
        });

      const result = await templateRepository.proofRequestUpdate(
        'template-id',
        user
      );

      expect(result).toEqual({ data: { id: 'template-id' } });

      expect(mocks.ddbDocClient).toHaveReceivedCommandWith(UpdateCommand, {
        ConditionExpression:
          '#templateStatus = :condition_1_templateStatus AND #templateType = :condition_2_templateType AND #clientId = :condition_3_clientId AND attribute_exists (#id) AND #proofingEnabled = :condition_5_proofingEnabled',
        ExpressionAttributeNames: {
          '#id': 'id',
          '#clientId': 'clientId',
          '#templateStatus': 'templateStatus',
          '#templateType': 'templateType',
          '#updatedAt': 'updatedAt',
          '#proofingEnabled': 'proofingEnabled',
        },
        ExpressionAttributeValues: {
          ':condition_1_templateStatus': 'PENDING_PROOF_REQUEST',
          ':condition_2_templateType': 'LETTER',
          ':condition_3_clientId': clientId,
          ':condition_5_proofingEnabled': true,
          ':templateStatus': 'WAITING_FOR_PROOF',
          ':updatedAt': '2024-12-27T00:00:00.000Z',
        },
        Key: { id: 'template-id', owner: userId },
        ReturnValues: 'ALL_NEW',
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        TableName: 'templates',
        UpdateExpression:
          'SET #templateStatus = :templateStatus, #updatedAt = :updatedAt',
      });
    });

    test('returns 404 response when GSI query cannot find owned template', async () => {
      const { templateRepository, mocks } = setup();

      mocks.ddbDocClient.on(QueryCommand).resolves({
        Items: [{ id: templateId, owner: 'someone-else' }],
      });

      const response = await templateRepository.proofRequestUpdate(
        'template-id',
        user
      );

      expect(response).toEqual({
        error: {
          errorMeta: {
            code: 404,
            description: 'Template not found',
          },
        },
      });
    });

    it('returns 404 error response when conditional check fails due to template not existing', async () => {
      const { templateRepository, mocks } = setup();

      const err = new ConditionalCheckFailedException({
        message: 'condition check failed',
        $metadata: {},
      });

      mocks.ddbDocClient
        .on(QueryCommand)
        .resolvesOnce({
          Items: [{ id: 'template-id', owner: clientOwner }],
        })
        .on(UpdateCommand)
        .rejectsOnce(err);

      const result = await templateRepository.proofRequestUpdate(
        'template-id',
        user
      );

      expect(result).toEqual({
        error: {
          actualError: err,
          errorMeta: {
            code: 404,
            description: 'Template not found',
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
        },
      });

      mocks.ddbDocClient
        .on(QueryCommand)
        .resolvesOnce({
          Items: [{ id: 'template-id', owner: clientOwner }],
        })
        .on(UpdateCommand)
        .rejectsOnce(err);

      const result = await templateRepository.proofRequestUpdate(
        'template-id',
        user
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

      mocks.ddbDocClient
        .on(QueryCommand)
        .resolvesOnce({
          Items: [{ id: 'template-id', owner: clientOwner }],
        })
        .on(UpdateCommand)
        .rejectsOnce(err);

      const result = await templateRepository.proofRequestUpdate(
        'template-id',
        user
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
