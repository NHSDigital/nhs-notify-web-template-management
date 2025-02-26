import { readFileSync } from 'node:fs';
import { TestUserClient } from './test-user-client';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const { email, templateId, userId } = JSON.parse(
  readFileSync('./pa11y-fixtures.json', 'utf8')
);

const teardown = async () => {
  const ddbDocClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: 'eu-west-2' })
  );

  await ddbDocClient.send(
    new DeleteCommand({
      TableName: process.env.TEMPLATES_TABLE_NAME,
      Key: {
        owner: userId,
        id: templateId,
      },
    })
  );

  await new TestUserClient('./frontend').deleteTestUser(email);
};

teardown();
