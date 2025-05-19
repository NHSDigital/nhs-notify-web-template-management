import { retrieveTemplates, updateItem } from '@/src/utils/ddb-utils';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const mockItem1 = {
  templateType: {
    S: 'LETTER',
  },
  updatedAt: {
    S: '2000-01-01T00:00:00.000Z',
  },
  owner: {
    S: 'abc-123',
  },
  id: {
    S: 'item-1',
  },
};

const mockItem2 = {
  templateType: {
    S: 'EMAIL',
  },
  updatedAt: {
    S: '2000-01-01T00:00:00.000Z',
  },
  owner: {
    S: 'abc-123',
  },
  id: {
    S: 'item-2',
  },
};

const mockItem3 = {
  templateType: {
    S: 'SMS',
  },
  updatedAt: {
    S: '2000-01-01T00:00:00.000Z',
  },
  owner: {
    S: 'abc-123',
  },
  id: {
    S: 'item-3',
  },
};

const testParameters = {
  destinationOwner: 'def-456',
  environment: 'testenv',
  sourceOwner: 'abc-123',
};

jest.mock('@aws-sdk/client-dynamodb', () => ({
  ...jest.requireActual('@aws-sdk/client-dynamodb'),
}));

describe('ddb-utils', () => {
  describe('retrieveTemplates', () => {
    test('should retrieve templates over multiple pages', async () => {
      // arrange
      const sendSpy = jest.spyOn(DynamoDBClient.prototype, 'send');
      sendSpy
        .mockImplementationOnce(() => ({
          Items: [mockItem1, mockItem2],
          LastEvaluatedKey: {
            id: { S: mockItem2.id },
            owner: { S: mockItem2.owner },
          },
        }))
        .mockImplementationOnce(() => ({
          Items: [mockItem3],
        }));

      // act
      const results = await retrieveTemplates(testParameters);

      // assert
      expect(results).toEqual([mockItem1, mockItem2, mockItem3]);
      expect(sendSpy).toHaveBeenCalledTimes(2);
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            ExpressionAttributeNames: { '#owner': 'owner' },
            ExpressionAttributeValues: { ':owner': { S: 'abc-123' } },
            KeyConditionExpression: '#owner = :owner',
            TableName: 'nhs-notify-testenv-app-api-templates',
            ExclusiveStartKey: undefined,
          },
        })
      );
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            ExpressionAttributeNames: { '#owner': 'owner' },
            ExpressionAttributeValues: { ':owner': { S: 'abc-123' } },
            KeyConditionExpression: '#owner = :owner',
            TableName: 'nhs-notify-testenv-app-api-templates',
            ExclusiveStartKey: {
              id: { S: mockItem2.id },
              owner: { S: mockItem2.owner },
            },
          },
        })
      );
    });

    test('should handle no results', async () => {
      // arrange
      const sendSpy = jest.spyOn(DynamoDBClient.prototype, 'send');
      sendSpy.mockImplementationOnce(() => ({}));

      // act
      const results = await retrieveTemplates(testParameters);

      // assert
      expect(results).toEqual([]);
      expect(sendSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateItem', () => {
    test('should re-create item with new owner and delete old item', async () => {
      // arrange
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-05-14'));

      const sendSpy = jest.spyOn(DynamoDBClient.prototype, 'send');
      sendSpy.mockImplementation(() => {});

      // act
      await updateItem(mockItem1, testParameters);

      // assert
      expect(sendSpy).toHaveBeenCalledTimes(1);
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            TransactItems: [
              {
                Put: {
                  TableName: 'nhs-notify-testenv-app-api-templates',
                  Item: {
                    id: { S: 'item-1' },
                    owner: { S: 'def-456' },
                    templateType: { S: 'LETTER' },
                    updatedAt: { S: '2025-05-14T00:00:00.000Z' },
                  },
                },
              },
              {
                Delete: {
                  TableName: 'nhs-notify-testenv-app-api-templates',
                  Key: { id: { S: 'item-1' }, owner: { S: 'abc-123' } },
                },
              },
            ],
          },
        })
      );
    });
  });
});
