import {
  retrieveAllRoutingConfigurations,
  retrieveAllTemplates,
  updateRoutingConfigurationRecord,
  updateTemplateRecord,
} from '@/src/utils/template-management-repository';
import {
  ConditionalCheckFailedException,
  TableNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

jest.mock('@/src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@aws-sdk/client-dynamodb', () => ({
  ...jest.requireActual('@aws-sdk/client-dynamodb'),
}));
jest.mock('@aws-sdk/lib-dynamodb', () => ({
  ...jest.requireActual('@aws-sdk/lib-dynamodb'),
  DynamoDBClient: jest.fn(),
}));

describe('template-management-repository', () => {
  describe('retrieveAllTemplates', () => {
    test('should retrieve all template records, handling pagination', async () => {
      // arrange
      const scanSpy = jest.spyOn(DynamoDBDocumentClient.prototype, 'send');
      scanSpy
        .mockImplementationOnce(() => ({
          Items: [{ id: 'template1' }, { id: 'template2' }],
          LastEvaluatedKey: { id: 'template2' },
        }))
        .mockImplementationOnce(() => ({
          Items: [{ id: 'template3' }],
          LastEvaluatedKey: { id: 'template3' },
        }))
        .mockImplementationOnce(() => ({}));

      // act
      const result = await retrieveAllTemplates('test-env');

      // assert
      expect(result).toEqual([
        { id: 'template1' },
        { id: 'template2' },
        { id: 'template3' },
      ]);
      expect(scanSpy).toHaveBeenCalledTimes(3);
      expect(scanSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          input: {
            TableName: 'nhs-notify-test-env-app-api-templates',
            ExclusiveStartKey: undefined,
          },
        })
      );
      expect(scanSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          input: {
            TableName: 'nhs-notify-test-env-app-api-templates',
            ExclusiveStartKey: { id: 'template2' },
          },
        })
      );
    });
  });

  describe('retrieveAllRoutingConfigurations', () => {
    test('should retrieve all routing configuration records, handling pagination', async () => {
      // arrange
      const scanSpy = jest.spyOn(DynamoDBDocumentClient.prototype, 'send');
      scanSpy
        .mockImplementationOnce(() => ({
          Items: [
            { id: 'routingConfiguration1' },
            { id: 'routingConfiguration2' },
          ],
          LastEvaluatedKey: { id: 'routingConfiguration2' },
        }))
        .mockImplementationOnce(() => ({
          Items: [{ id: 'routingConfiguration3' }],
        }));

      // act
      const result = await retrieveAllRoutingConfigurations('test-env');

      // assert
      expect(result).toEqual([
        { id: 'routingConfiguration1' },
        { id: 'routingConfiguration2' },
        { id: 'routingConfiguration3' },
      ]);
      expect(scanSpy).toHaveBeenCalledTimes(2);
      expect(scanSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          input: {
            TableName: 'nhs-notify-test-env-app-api-routing-configuration',
            ExclusiveStartKey: undefined,
          },
        })
      );
      expect(scanSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          input: {
            TableName: 'nhs-notify-test-env-app-api-routing-configuration',
            ExclusiveStartKey: { id: 'routingConfiguration2' },
          },
        })
      );
    });
  });

  describe('updateTemplateRecord', () => {
    test('should update template record successfully', async () => {
      // arrange
      const sendSpy = jest.spyOn(DynamoDBDocumentClient.prototype, 'send');
      sendSpy.mockImplementationOnce(() => ({}));

      const templateRecord = {
        id: 'template1',
        owner: 'owner1',
        lockNumber: 1,
        createdBy: 'originalCreator',
        updatedBy: 'originalUpdater',
      };

      // act
      const result = await updateTemplateRecord(
        'test-env',
        templateRecord,
        'newCreator',
        'newUpdater'
      );

      // assert
      expect(result).toBe('success');
      expect(sendSpy).toHaveBeenCalledTimes(1);
      expect(sendSpy.mock.calls[0][0].input).toMatchSnapshot();
    });

    test('should update template record successfully with missing createdBy', async () => {
      // arrange
      const sendSpy = jest.spyOn(DynamoDBDocumentClient.prototype, 'send');
      sendSpy.mockImplementationOnce(() => ({}));

      const templateRecord = {
        id: 'template1',
        owner: 'owner1',
        createdBy: 'originalCreator',
        updatedBy: 'originalUpdater',
      };

      // act
      const result = await updateTemplateRecord(
        'test-env',
        templateRecord,
        undefined,
        'newUpdater'
      );

      // assert
      expect(result).toBe('success');
      expect(sendSpy).toHaveBeenCalledTimes(1);
      expect(sendSpy.mock.calls[0][0].input).toMatchSnapshot();
    });

    test('should update template record successfully with missing updatedBy', async () => {
      // arrange
      const sendSpy = jest.spyOn(DynamoDBDocumentClient.prototype, 'send');
      sendSpy.mockImplementationOnce(() => ({}));

      const templateRecord = {
        id: 'template1',
        owner: 'owner1',
        createdBy: 'originalCreator',
        updatedBy: 'originalUpdater',
      };

      // act
      const result = await updateTemplateRecord(
        'test-env',
        templateRecord,
        'newCreator',
        undefined
      );

      // assert
      expect(result).toBe('success');
      expect(sendSpy).toHaveBeenCalledTimes(1);
      expect(sendSpy.mock.calls[0][0].input).toMatchSnapshot();
    });

    test('should handle a condition failed exception', async () => {
      // arrange
      const sendSpy = jest.spyOn(DynamoDBDocumentClient.prototype, 'send');
      const mockError = new ConditionalCheckFailedException({
        message: 'The conditional request failed',
        $metadata: { httpStatusCode: 409 },
      });
      sendSpy.mockRejectedValueOnce(mockError as never);

      const templateRecord = {
        id: 'template1',
        owner: 'owner1',
        lockNumber: 1,
        createdBy: 'originalCreator',
        updatedBy: 'originalUpdater',
      };

      // act
      const result = await updateTemplateRecord(
        'test-env',
        templateRecord,
        'newCreator',
        'newUpdater'
      );

      // assert
      expect(result).toBe('lock-failure');
    });

    test('should handle other exceptions', async () => {
      // arrange
      const sendSpy = jest.spyOn(DynamoDBDocumentClient.prototype, 'send');
      const mockError = new TableNotFoundException({
        message: 'Table not found',
        $metadata: { httpStatusCode: 404 },
      });
      sendSpy.mockRejectedValueOnce(mockError as never);

      const templateRecord = {
        id: 'template1',
        owner: 'owner1',
        lockNumber: 1,
        createdBy: 'originalCreator',
        updatedBy: 'originalUpdater',
      };

      // act
      const result = await updateTemplateRecord(
        'test-env',
        templateRecord,
        'newCreator',
        'newUpdater'
      );

      // assert
      expect(result).toBe('other-error');
    });
  });

  describe('updateRoutingConfigurationRecord', () => {
    test('should update routing configuration record successfully', async () => {
      // arrange
      const sendSpy = jest.spyOn(DynamoDBDocumentClient.prototype, 'send');
      sendSpy.mockImplementationOnce(() => ({}));

      const routingConfigurationRecord = {
        id: 'routingConfiguration1',
        owner: 'owner1',
        lockNumber: 1,
        createdBy: 'originalCreator',
        updatedBy: 'originalUpdater',
      };

      // act
      const result = await updateRoutingConfigurationRecord(
        'test-env',
        routingConfigurationRecord,
        'newCreator',
        'newUpdater'
      );

      // assert
      expect(result).toBe('success');
      expect(sendSpy).toHaveBeenCalledTimes(1);
      expect(sendSpy.mock.calls[0][0].input).toMatchSnapshot();
    });
  });
});
