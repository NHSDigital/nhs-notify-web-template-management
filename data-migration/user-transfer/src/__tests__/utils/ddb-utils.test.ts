import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  getTemplate,
  listAllTemplates,
  getTemplates,
  migrateOwnership,
} from '../../utils/ddb-utils';

test('listAllTemplates', async () => {
  const sendSpy = jest.spyOn(DynamoDBClient.prototype, 'send');
  sendSpy
    .mockImplementationOnce(() => ({
      Items: [
        { id: { S: 'template-id-1' }, owner: { S: 'template-owner-1' } },
        { id: { S: 'template-id-2' }, owner: { S: 'template-owner-2' } },
      ],
      LastEvaluatedKey: '2',
    }))
    .mockImplementationOnce(() => ({
      Items: [{ id: { S: 'template-id-3' }, owner: { S: 'template-owner-3' } }],
      LastEvaluatedKey: '3',
    }))
    .mockImplementation(() => ({
      Items: undefined,
    }));

  const templates = await listAllTemplates('table-name');
  expect(templates).toEqual([
    { id: 'template-id-1', owner: 'template-owner-1' },
    { id: 'template-id-2', owner: 'template-owner-2' },
    { id: 'template-id-3', owner: 'template-owner-3' },
  ]);

  expect(sendSpy).toHaveBeenCalledTimes(3);
  expect(sendSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        TableName: 'table-name',
        FilterExpression:
          'attribute_exists(#owner) AND NOT begins_with(#owner, :subString)',
        ExpressionAttributeNames: { '#owner': 'owner', '#id': 'id' },
        ExpressionAttributeValues: { ':subString': { S: 'CLIENT#' } },
        ExclusiveStartKey: undefined,
        ProjectionExpression: '#id,#owner',
      },
    })
  );
  expect(sendSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        TableName: 'table-name',
        FilterExpression:
          'attribute_exists(#owner) AND NOT begins_with(#owner, :subString)',
        ExpressionAttributeNames: { '#owner': 'owner', '#id': 'id' },
        ExpressionAttributeValues: { ':subString': { S: 'CLIENT#' } },
        ExclusiveStartKey: '2',
        ProjectionExpression: '#id,#owner',
      },
    })
  );
  expect(sendSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        TableName: 'table-name',
        FilterExpression:
          'attribute_exists(#owner) AND NOT begins_with(#owner, :subString)',
        ExpressionAttributeNames: { '#owner': 'owner', '#id': 'id' },
        ExpressionAttributeValues: { ':subString': { S: 'CLIENT#' } },
        ExclusiveStartKey: '3',
        ProjectionExpression: '#id,#owner',
      },
    })
  );
});

test('getTemplate', async () => {
  const sendSpy = jest.spyOn(DynamoDBClient.prototype, 'send');
  sendSpy.mockImplementation(() => ({
    Item: { id: { S: 'template-id' }, owner: { S: 'template-owner' } },
  }));

  const template = await getTemplate(
    'table-name',
    'template-owner',
    'template-id'
  );
  expect(template).toEqual({
    id: { S: 'template-id' },
    owner: { S: 'template-owner' },
  });

  expect(sendSpy).toHaveBeenCalledTimes(1);
  expect(sendSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        TableName: 'table-name',
        Key: { id: { S: 'template-id' }, owner: { S: 'template-owner' } },
      },
    })
  );
});

test('getTemplates - unprocessed keys found', async () => {
  const sendSpy = jest.spyOn(DynamoDBClient.prototype, 'send');
  sendSpy.mockImplementation(() => ({
    UnprocessedKeys: {
      'table-name': 1,
    },
  }));

  await expect(
    async () =>
      await getTemplates('table-name', [
        { id: 'template-id', owner: 'template-owner' },
      ])
  ).rejects.toThrow(
    'unable to get templates due to UnprocessedKeys keys from DynamoDB'
  );

  expect(sendSpy).toHaveBeenCalledTimes(1);
  expect(sendSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        RequestItems: {
          'table-name': {
            Keys: [
              { id: { S: 'template-id' }, owner: { S: 'template-owner' } },
            ],
          },
        },
      },
    })
  );
});

test('getTemplates - no responses found', async () => {
  const sendSpy = jest.spyOn(DynamoDBClient.prototype, 'send');
  sendSpy.mockImplementation(() => ({}));

  await expect(
    async () =>
      await getTemplates('table-name', [
        { id: 'template-id', owner: 'template-owner' },
      ])
  ).rejects.toThrow(
    'unable to get templates due to no Responses from DynamoDb'
  );

  expect(sendSpy).toHaveBeenCalledTimes(1);
  expect(sendSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        RequestItems: {
          'table-name': {
            Keys: [
              { id: { S: 'template-id' }, owner: { S: 'template-owner' } },
            ],
          },
        },
      },
    })
  );
});

test('getTemplates - processes no chunks', async () => {
  const templates = await getTemplates('table-name', []);
  expect(templates).toEqual([]);
});

test('getTemplates - processes multiple chunks', async () => {
  const sendSpy = jest.spyOn(DynamoDBClient.prototype, 'send');
  sendSpy
    .mockImplementationOnce(() => ({
      Responses: { 'table-name': [1] },
    }))
    .mockImplementation(() => ({
      Responses: { 'table-name': [2] },
    }));

  const templates = await getTemplates('table-name', [
    { id: 'template-id-1', owner: 'template-owner-1' },
    { id: 'template-id-2', owner: 'template-owner-2' },
    { id: 'template-id-3', owner: 'template-owner-3' },
    { id: 'template-id-4', owner: 'template-owner-4' },
    { id: 'template-id-5', owner: 'template-owner-5' },
    { id: 'template-id-6', owner: 'template-owner-6' },
    { id: 'template-id-7', owner: 'template-owner-7' },
    { id: 'template-id-8', owner: 'template-owner-8' },
    { id: 'template-id-9', owner: 'template-owner-9' },
    { id: 'template-id-10', owner: 'template-owner-10' },
    { id: 'template-id-11', owner: 'template-owner-11' },
    { id: 'template-id-12', owner: 'template-owner-12' },
    { id: 'template-id-13', owner: 'template-owner-13' },
    { id: 'template-id-14', owner: 'template-owner-14' },
    { id: 'template-id-15', owner: 'template-owner-15' },
    { id: 'template-id-16', owner: 'template-owner-16' },
    { id: 'template-id-17', owner: 'template-owner-17' },
    { id: 'template-id-18', owner: 'template-owner-18' },
    { id: 'template-id-19', owner: 'template-owner-19' },
    { id: 'template-id-20', owner: 'template-owner-20' },
    { id: 'template-id-21', owner: 'template-owner-21' },
    { id: 'template-id-22', owner: 'template-owner-22' },
    { id: 'template-id-23', owner: 'template-owner-23' },
    { id: 'template-id-24', owner: 'template-owner-24' },
    { id: 'template-id-25', owner: 'template-owner-25' },
    { id: 'template-id-26', owner: 'template-owner-26' },
  ]);
  expect(templates).toEqual([1, 2]);

  expect(sendSpy).toHaveBeenCalledTimes(2);
  expect(sendSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        RequestItems: {
          'table-name': {
            Keys: [
              { id: { S: 'template-id-1' }, owner: { S: 'template-owner-1' } },
              { id: { S: 'template-id-2' }, owner: { S: 'template-owner-2' } },
              { id: { S: 'template-id-3' }, owner: { S: 'template-owner-3' } },
              { id: { S: 'template-id-4' }, owner: { S: 'template-owner-4' } },
              { id: { S: 'template-id-5' }, owner: { S: 'template-owner-5' } },
              { id: { S: 'template-id-6' }, owner: { S: 'template-owner-6' } },
              { id: { S: 'template-id-7' }, owner: { S: 'template-owner-7' } },
              { id: { S: 'template-id-8' }, owner: { S: 'template-owner-8' } },
              { id: { S: 'template-id-9' }, owner: { S: 'template-owner-9' } },
              {
                id: { S: 'template-id-10' },
                owner: { S: 'template-owner-10' },
              },
              {
                id: { S: 'template-id-11' },
                owner: { S: 'template-owner-11' },
              },
              {
                id: { S: 'template-id-12' },
                owner: { S: 'template-owner-12' },
              },
              {
                id: { S: 'template-id-13' },
                owner: { S: 'template-owner-13' },
              },
              {
                id: { S: 'template-id-14' },
                owner: { S: 'template-owner-14' },
              },
              {
                id: { S: 'template-id-15' },
                owner: { S: 'template-owner-15' },
              },
              {
                id: { S: 'template-id-16' },
                owner: { S: 'template-owner-16' },
              },
              {
                id: { S: 'template-id-17' },
                owner: { S: 'template-owner-17' },
              },
              {
                id: { S: 'template-id-18' },
                owner: { S: 'template-owner-18' },
              },
              {
                id: { S: 'template-id-19' },
                owner: { S: 'template-owner-19' },
              },
              {
                id: { S: 'template-id-20' },
                owner: { S: 'template-owner-20' },
              },
              {
                id: { S: 'template-id-21' },
                owner: { S: 'template-owner-21' },
              },
              {
                id: { S: 'template-id-22' },
                owner: { S: 'template-owner-22' },
              },
              {
                id: { S: 'template-id-23' },
                owner: { S: 'template-owner-23' },
              },
              {
                id: { S: 'template-id-24' },
                owner: { S: 'template-owner-24' },
              },
              {
                id: { S: 'template-id-25' },
                owner: { S: 'template-owner-25' },
              },
            ],
          },
        },
      },
    })
  );
  expect(sendSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        RequestItems: {
          'table-name': {
            Keys: [
              {
                id: { S: 'template-id-26' },
                owner: { S: 'template-owner-26' },
              },
            ],
          },
        },
      },
    })
  );
});

test('migrateOwnership', async () => {
  const sendSpy = jest.spyOn(DynamoDBClient.prototype, 'send');
  sendSpy.mockImplementation(() => ({}));

  const response = await migrateOwnership(
    'table-name',
    { id: { S: 'template-id' }, owner: { S: 'user-owner' } },
    'user-owner',
    'client-owner'
  );

  expect(response).toEqual({});

  expect(sendSpy).toHaveBeenCalledTimes(1);
  expect(sendSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      input: {
        TransactItems: [
          {
            Put: {
              TableName: 'table-name',
              Item: {
                id: { S: 'template-id' },
                owner: { S: 'CLIENT#client-owner' },
                clientId: { S: 'client-owner' },
                createdBy: { S: 'user-owner' },
                updatedBy: { S: 'user-owner' },
              },
            },
          },
          {
            Delete: {
              TableName: 'table-name',
              Key: {
                id: { S: 'template-id' },
                owner: { S: 'user-owner' },
              },
            },
          },
        ],
        ReturnConsumedCapacity: 'TOTAL',
      },
    })
  );
});
