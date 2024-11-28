import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import {
  TemplateStatus,
  TemplateType,
  UpdateTemplateInput,
} from 'nhs-notify-templates-client';
import { v4 as uuidv4 } from 'uuid';
import {
  ConditionalCheckFailedException,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { Template, templateRepository } from '../../../../templates/domain/template';

jest.mock('uuid');

const uuidMock = jest.mocked(uuidv4);
const ddbMock = mockClient(DynamoDBDocumentClient);

const template: Template = {
  id: 'real-id',
  owner: 'real-owner',
  name: 'name',
  message: 'message',
  subject: 'pickles',
  type: TemplateType.EMAIL,
  version: 1,
  createdAt: '2024-12-27T00:00:00.000Z',
  updatedAt: '2024-12-27T00:00:00.000Z',
  status: TemplateStatus.NOT_YET_SUBMITTED,
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
      { id: 'real-id', owner: 'fake-owner' },
      { id: 'fake-id', owner: 'real-owner' },
    ])(
      'should return undefined when, templateId and owner does not match database record',
      async ({ id, owner }) => {
        ddbMock
          .on(GetCommand, {
            TableName: 'templates',
            Key: { id: 'real-id', owner: 'real-owner' },
          })
          .resolves({
            Item: { id: 'real-id', owner: 'real-owner' },
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

      const response = await templateRepository.get('real-id', 'real-owner');

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
          Key: { id: 'real-id', owner: 'real-owner' },
        })
        .resolves({
          Item: template,
        });

      const response = await templateRepository.get('real-id', 'real-owner');

      expect(response).toEqual({
        data: template,
      });
    });
  });

  describe('create', () => {
    test('should return error when, unexpected error occurs', async () => {
      uuidMock.mockReturnValue('real-id');

      ddbMock.on(PutCommand).rejects(new Error('InternalServerError'));

      const response = await templateRepository.create(
        {
          type: TemplateType.EMAIL,
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

    test('should return error when, ConsumedCapacity is 0', async () => {
      uuidMock.mockReturnValue('real-id');

      ddbMock
        .on(PutCommand, {
          TableName: 'templates',
          Item: template,
        })
        .resolves({
          ConsumedCapacity: {
            CapacityUnits: 0,
          },
        });

      const response = await templateRepository.create(
        {
          type: TemplateType.EMAIL,
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
          actualError: new Error(
            'Expected DynamoDB CapacityUnits to be greater than 0'
          ),
        },
      });
    });

    test('should create template', async () => {
      uuidMock.mockReturnValue('real-id');

      ddbMock
        .on(PutCommand, {
          TableName: 'templates',
          Item: template,
        })
        .resolves({
          ConsumedCapacity: {
            CapacityUnits: 1,
          },
        });

      const response = await templateRepository.create(
        {
          type: TemplateType.EMAIL,
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
    test('should return error when, ConditionalCheckException occurs', async () => {
      const error = new ConditionalCheckFailedException({
        message: 'mocked',
        $metadata: { httpStatusCode: 400 },
      });

      ddbMock.on(UpdateCommand).rejects(error);

      const response = await templateRepository.update(
        {
          id: 'real-id',
          name: 'name',
          message: 'message',
          subject: 'subject',
          status: TemplateStatus.NOT_YET_SUBMITTED,
        },
        'real-owner'
      );

      expect(response).toEqual({
        error: {
          code: 400,
          message:
            'Can not update template due to status being NOT_YET_SUBMITTED',
          actualError: error,
        },
      });
    });

    test('should return error when, ResourceNotFoundException occurs', async () => {
      const error = new ResourceNotFoundException({
        message: 'mocked',
        $metadata: { httpStatusCode: 400 },
      });

      ddbMock.on(UpdateCommand).rejects(error);

      const response = await templateRepository.update(
        {
          id: 'real-id',
          name: 'name',
          message: 'message',
          subject: 'subject',
          status: TemplateStatus.NOT_YET_SUBMITTED,
        },
        'real-owner'
      );

      expect(response).toEqual({
        error: {
          code: 404,
          message: 'Template not found',
          actualError: error,
        },
      });
    });

    test('should return error when, an unexpected error occurs', async () => {
      const error = new Error('mocked');

      ddbMock.on(UpdateCommand).rejects(error);

      const response = await templateRepository.update(
        {
          id: 'real-id',
          name: 'name',
          message: 'message',
          subject: 'subject',
          status: TemplateStatus.NOT_YET_SUBMITTED,
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

    test('should update template', async () => {
      const updatedTemplate: UpdateTemplateInput = {
        id: 'real-id',
        name: 'updated-name',
        message: 'updated-message',
        subject: 'updated-subject',
        status: TemplateStatus.SUBMITTED,
      };

      ddbMock
        .on(UpdateCommand, {
          TableName: 'templates',
          Key: { id: 'real-id', owner: 'real-owner' },
          UpdateExpression: `set ${[
            `name = :name`,
            'message = :message',
            'subject = :subject',
            'updatedAt = :updateAt',
            'status = :status',
          ].join(', ')}`,
          ExpressionAttributeValues: {
            ':name': updatedTemplate.name,
            ':message': updatedTemplate.message,
            ':subject': updatedTemplate.subject,
            ':status': updatedTemplate.status,
            ':updateAt': '2024-12-27T00:00:00.000Z',
            ':not_yet_submitted': TemplateStatus.NOT_YET_SUBMITTED,
          },
          ConditionExpression: 'status = :not_yet_submitted',
          ReturnValues: 'ALL_NEW',
        })
        .resolves({
          Attributes: {
            ...template,
            ...updatedTemplate,
          },
        });

      const response = await templateRepository.update(
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
