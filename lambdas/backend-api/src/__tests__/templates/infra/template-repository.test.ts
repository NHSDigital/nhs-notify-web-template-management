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
  TemplateStatus,
  TemplateType,
  UpdateTemplate,
} from 'nhs-notify-backend-client';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import {
  DatabaseTemplate,
  templateRepository,
} from '@backend-api/templates/infra';

jest.mock('node:crypto');

const uuidMock = jest.mocked(uuidv4);
const ddbMock = mockClient(DynamoDBDocumentClient);

const template: DatabaseTemplate = {
  id: 'abc-def-ghi-jkl-123',
  owner: 'real-owner',
  name: 'name',
  message: 'message',
  subject: 'pickles',
  templateType: TemplateType.EMAIL,
  version: 1,
  createdAt: '2024-12-27T00:00:00.000Z',
  updatedAt: '2024-12-27T00:00:00.000Z',
  templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
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
      'should return undefined when, templateId and owner does not match database record',
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
          Item: template,
        });

      const response = await templateRepository.get(
        'abc-def-ghi-jkl-123',
        'real-owner'
      );

      expect(response).toEqual({
        data: template,
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
          Items: [template],
        });

      const response = await templateRepository.list('real-owner');

      expect(response).toEqual({
        data: [template],
      });
    });
  });

  describe('create', () => {
    test('should return error when, unexpected error occurs', async () => {
      uuidMock.mockReturnValue('abc-def-ghi-jkl-123');

      ddbMock.on(PutCommand).rejects(new Error('InternalServerError'));

      const response = await templateRepository.create(
        {
          templateType: TemplateType.EMAIL,
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

    test('should create template', async () => {
      uuidMock.mockReturnValue('abc-def-ghi-jkl-123');

      ddbMock
        .on(PutCommand, {
          TableName: 'templates',
          Item: template,
        })
        .resolves({});

      const response = await templateRepository.create(
        {
          templateType: TemplateType.EMAIL,
          name: 'name',
          message: 'message',
          subject: 'pickles',
        },
        'real-owner'
      );

      expect(response).toEqual({
        data: template,
      });
    });
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
          templateType: { S: TemplateType.SMS },
          templateStatus: { S: TemplateStatus.NOT_YET_SUBMITTED },
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
          templateType: { S: TemplateType.EMAIL },
          templateStatus: { S: TemplateStatus.SUBMITTED },
        },
        code: 400,
        message: 'Can not update template',
        details: {
          templateStatus: 'Expected NOT_YET_SUBMITTED but got SUBMITTED',
        },
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
            templateStatus: TemplateStatus.SUBMITTED,
            templateType: TemplateType.EMAIL,
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
          templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
          templateType: TemplateType.EMAIL,
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

    test('should update template with subject', async () => {
      const updatedTemplate: UpdateTemplate = {
        name: 'updated-name',
        message: 'updated-message',
        subject: 'updated-subject',
        templateStatus: TemplateStatus.SUBMITTED,
        templateType: TemplateType.EMAIL,
      };

      ddbMock
        .on(UpdateCommand, {
          TableName: 'templates',
          Key: { id: 'abc-def-ghi-jkl-123', owner: 'real-owner' },
        })
        .resolves({
          Attributes: {
            ...template,
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
          ...template,
          ...updatedTemplate,
        },
      });
    });

    test('should update template to deleted state', async () => {
      const updatedTemplate: UpdateTemplate = {
        name: 'updated-name',
        message: 'updated-message',
        templateStatus: TemplateStatus.DELETED,
        templateType: TemplateType.NHS_APP,
      };

      ddbMock
        .on(UpdateCommand, {
          TableName: 'templates',
          Key: { id: 'abc-def-ghi-jkl-123', owner: 'real-owner' },
        })
        .resolves({
          Attributes: {
            ...template,
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
          ...template,
          ...updatedTemplate,
        },
      });
    });
  });
});
