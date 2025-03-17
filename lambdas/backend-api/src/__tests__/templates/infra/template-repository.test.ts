import { randomUUID as uuidv4 } from 'node:crypto';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import {
  EmailProperties,
  LetterProperties,
  NhsAppProperties,
  SmsProperties,
  ValidatedUpdateTemplate,
} from 'nhs-notify-backend-client';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { DatabaseTemplate, templateRepository } from '../../../templates/infra';

jest.mock('node:crypto');

const uuidMock = jest.mocked(uuidv4);
const ddbMock = mockClient(DynamoDBDocumentClient);

const emailProperties: EmailProperties = {
  message: 'message',
  subject: 'pickles',
};

const smsProperties: SmsProperties = {
  message: 'message',
};

const nhsAppProperties: NhsAppProperties = {
  message: 'message',
};

const letterProperties: LetterProperties = {
  letterType: 'x0',
  language: 'en',
  files: {
    pdfTemplate: {
      fileName: 'template.pdf',
    },
    testDataCsv: {
      fileName: 'test.csv',
    },
  },
};

const createTemplateProperties = {
  name: 'name',
};

const updateTemplateProperties = {
  ...createTemplateProperties,
  templateStatus: 'NOT_YET_SUBMITTED' as const,
};

const databaseTemplateProperties = {
  ...updateTemplateProperties,
  id: 'abc-def-ghi-jkl-123',
  owner: 'real-owner',
  version: 1,
  createdAt: '2024-12-27T00:00:00.000Z',
  updatedAt: '2024-12-27T00:00:00.000Z',
};

const emailTemplate: DatabaseTemplate = {
  templateType: 'EMAIL',
  ...emailProperties,
  ...databaseTemplateProperties,
};

const smsTemplate: DatabaseTemplate = {
  templateType: 'SMS',
  ...smsProperties,
  ...databaseTemplateProperties,
};

const nhsAppTemplate: DatabaseTemplate = {
  templateType: 'NHS_APP',
  ...nhsAppProperties,
  ...databaseTemplateProperties,
};

const letterTemplate: DatabaseTemplate = {
  templateType: 'LETTER',
  ...letterProperties,
  ...databaseTemplateProperties,
};

describe('templateRepository', () => {
  const OLD_ENV = { ...process.env };

  beforeAll(() => {
    process.env = {
      ...OLD_ENV,
      TEMPLATES_TABLE_NAME: 'templates',
    };
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2024, 11, 27));
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  beforeEach(() => {
    jest.resetAllMocks();
    ddbMock.reset();
  });

  describe('get', () => {
    test.each([
      { id: 'abc-def-ghi-jkl-123', owner: 'fake-owner' },
      { id: 'fake-id', owner: 'real-owner' },
    ])(
      'should return not found error when, templateId and owner does not match database record',
      async ({ id, owner }) => {
        ddbMock
          .on(GetCommand, {
            TableName: 'templates',
            Key: { id: 'abc-def-ghi-jkl-123', owner: 'real-owner' },
          })
          .resolves({
            Item: { id: 'abc-def-ghi-jkl-123', owner: 'real-owner' },
          });

        const response = await templateRepository.get(id, owner);

        expect(response).toEqual({
          error: {
            code: 404,
            message: 'Template not found',
          },
        });
      }
    );

    test('should return not found error when template status is DELETED', async () => {
      ddbMock.on(GetCommand).resolves({
        Item: {
          id: 'abc-def-ghi-jkl-123',
          owner: 'real-owner',
          templateStatus: 'DELETED',
        },
      });

      const response = await templateRepository.get(
        'abc-def-ghi-jkl-123',
        'real-owner'
      );

      expect(response).toEqual({
        error: {
          code: 404,
          message: 'Template not found',
        },
      });
    });

    test('should error when unexpected error occurs', async () => {
      ddbMock.on(GetCommand).rejects(new Error('InternalServerError'));

      const response = await templateRepository.get(
        'abc-def-ghi-jkl-123',
        'real-owner'
      );

      expect(response).toEqual({
        error: {
          code: 500,
          message: 'Failed to get template',
          actualError: new Error('InternalServerError'),
        },
      });
    });

    test('should return template', async () => {
      ddbMock
        .on(GetCommand, {
          TableName: 'templates',
          Key: { id: 'abc-def-ghi-jkl-123', owner: 'real-owner' },
        })
        .resolves({
          Item: emailTemplate,
        });

      const response = await templateRepository.get(
        'abc-def-ghi-jkl-123',
        'real-owner'
      );

      expect(response).toEqual({
        data: emailTemplate,
      });
    });
  });

  describe('list', () => {
    test('should return an empty array when no items', async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: undefined,
      });

      const response = await templateRepository.list('real-owner');

      expect(response).toEqual({
        data: [],
      });
    });

    test('should error when unexpected error occurs', async () => {
      ddbMock.on(QueryCommand).rejects(new Error('InternalServerError'));

      const response = await templateRepository.list('real-owner');

      expect(response).toEqual({
        error: {
          code: 500,
          message: 'Failed to list templates',
          actualError: new Error('InternalServerError'),
        },
      });
    });

    test('should return templates', async () => {
      ddbMock
        .on(QueryCommand, {
          TableName: 'templates',
          KeyConditionExpression: '#owner = :owner',
          ExpressionAttributeNames: {
            '#owner': 'owner',
          },
          ExpressionAttributeValues: {
            ':owner': 'real-owner',
          },
        })
        .resolves({
          Items: [emailTemplate, smsTemplate, nhsAppTemplate, letterTemplate],
        });

      const response = await templateRepository.list('real-owner');

      expect(response).toEqual({
        data: [emailTemplate, smsTemplate, nhsAppTemplate, letterTemplate],
      });
    });
  });

  describe('create', () => {
    test('should return error when, unexpected error occurs', async () => {
      uuidMock.mockReturnValue('abc-def-ghi-jkl-123');

      ddbMock.on(PutCommand).rejects(new Error('InternalServerError'));

      const response = await templateRepository.create(
        {
          templateType: 'EMAIL',
          name: 'name',
          message: 'message',
          subject: 'pickles',
        },
        'real-owner'
      );

      expect(response).toEqual({
        error: {
          code: 500,
          message: 'Failed to create template',
          actualError: new Error('InternalServerError'),
        },
      });
    });

    test.each([
      { templateType: 'EMAIL' as const, ...emailProperties },
      { templateType: 'SMS' as const, ...smsProperties },
      { templateType: 'NHS_APP' as const, ...nhsAppProperties },
      { templateType: 'LETTER' as const, ...letterProperties },
    ])(
      'should create template of type $templateType',
      async (channelProperties) => {
        uuidMock.mockReturnValue('abc-def-ghi-jkl-123');

        ddbMock
          .on(PutCommand, {
            TableName: 'templates',
            Item: {
              ...channelProperties,
              ...databaseTemplateProperties,
            },
          })
          .resolves({});

        const response = await templateRepository.create(
          {
            ...channelProperties,
            ...createTemplateProperties,
          },
          'real-owner'
        );

        expect(response).toEqual({
          data: {
            ...channelProperties,
            ...databaseTemplateProperties,
          },
        });
      }
    );
  });

  describe('update', () => {
    test.each([
      {
        Item: undefined,
        code: 404,
        message: 'Template not found',
      },
      {
        testName:
          'Fails when user tries to change templateType from SMS to EMAIL',
        Item: {
          templateType: { S: 'SMS' },
          templateStatus: { S: 'NOT_YET_SUBMITTED' },
        },
        code: 400,
        message: 'Can not change template templateType',
        details: {
          templateType: 'Expected SMS but got EMAIL',
        },
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
        const error = new ConditionalCheckFailedException({
          message: 'mocked',
          $metadata: { httpStatusCode: 400 },
          Item,
        });

        ddbMock.on(UpdateCommand).rejects(error);

        const response = await templateRepository.update(
          'abc-def-ghi-jkl-123',
          {
            name: 'name',
            message: 'message',
            subject: 'subject',
            templateStatus: 'SUBMITTED',
            templateType: 'EMAIL',
          },
          'real-owner'
        );

        expect(response).toEqual({
          error: {
            code,
            message,
            actualError: error,
            details,
          },
        });
      }
    );

    test('should return error when, an unexpected error occurs', async () => {
      const error = new Error('mocked');

      ddbMock.on(UpdateCommand).rejects(error);

      const response = await templateRepository.update(
        'abc-def-ghi-jkl-123',
        {
          name: 'name',
          message: 'message',
          subject: 'subject',
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: 'EMAIL',
        },
        'real-owner'
      );

      expect(response).toEqual({
        error: {
          code: 500,
          message: 'Failed to update template',
          actualError: error,
        },
      });
    });

    test.each([
      { templateType: 'EMAIL' as const, ...emailProperties },
      { templateType: 'SMS' as const, ...smsProperties },
      { templateType: 'NHS_APP' as const, ...nhsAppProperties },
      { templateType: 'LETTER' as const, ...letterProperties },
    ])(
      'should update template of type $templateType with name',
      async (channelProperties) => {
        const updatedTemplate: ValidatedUpdateTemplate = {
          ...channelProperties,
          ...updateTemplateProperties,
          name: 'updated-name',
          templateStatus: 'SUBMITTED',
        };

        ddbMock
          .on(UpdateCommand, {
            TableName: 'templates',
            Key: { id: 'abc-def-ghi-jkl-123', owner: 'real-owner' },
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
          'real-owner'
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

    test('should update template to deleted state', async () => {
      const updatedTemplate: ValidatedUpdateTemplate = {
        name: 'updated-name',
        message: 'updated-message',
        templateStatus: 'DELETED',
        templateType: 'NHS_APP',
      };

      ddbMock
        .on(UpdateCommand, {
          TableName: 'templates',
          Key: { id: 'abc-def-ghi-jkl-123', owner: 'real-owner' },
        })
        .resolves({
          Attributes: {
            ...emailTemplate,
            ...updatedTemplate,
          },
        });

      const response = await templateRepository.update(
        'abc-def-ghi-jkl-123',
        updatedTemplate,
        'real-owner'
      );

      expect(response).toEqual({
        data: {
          ...emailTemplate,
          ...updatedTemplate,
        },
      });
    });
  });
});
