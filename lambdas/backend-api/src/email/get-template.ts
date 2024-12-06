import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { ErrorWithStatusCode } from '../error-with-status-code';

const dynamoClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: 'eu-west-2' })
);

export const getTemplate = async (
  tableName: string,
  owner: string,
  id: string
) => {
  const { Item } = await dynamoClient.send(
    new GetCommand({
      TableName: tableName,
      Key: {
        owner,
        id,
      },
    })
  );

  if (!Item) {
    throw new ErrorWithStatusCode('Invalid template ID', 404);
  }

  return Item;
};
