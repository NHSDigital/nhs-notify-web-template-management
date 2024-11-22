import type { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: 'eu-west-2' })
);

export const handler: APIGatewayProxyHandler = async (event) => {
  await client.send(
    new PutCommand({
      TableName: process.env.TEMPLATES_TABLE_NAME ?? '',
      Item: {
        owner: 'test',
        id: 'test',
        content: 'content',
      },
    })
  );

  console.log(event);

  return {
    statusCode: 200,
    body: JSON.stringify({}),
  };
};
