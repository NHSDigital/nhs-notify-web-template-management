import { readFileSync } from 'node:fs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { BackendConfigHelper } from 'nhs-notify-web-template-management-util-backend-config';
import path from 'node:path';
import { TestUserClient } from './test-user-client';
import type { FixtureData } from './types';

const { users, templateIds }: FixtureData = JSON.parse(
  readFileSync('./pa11y-fixtures.json', 'utf8')
);

const teardown = async () => {
  const ddbDocClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: 'eu-west-2' })
  );

  const backendConfig = BackendConfigHelper.fromTerraformOutputsFile(
    path.join(__dirname, '..', '..', 'sandbox_tf_outputs.json')
  );

  const templatesToDelete = Object.entries(templateIds).flatMap(
    ([clientId, templateIdsForClientMap]) => {
      const templateIdsForClient = Object.values(templateIdsForClientMap);

      return templateIdsForClient.map((id) => ({
        clientId,
        id,
      }));
    }
  );

  await Promise.all(
    templatesToDelete.map(({ clientId, id }) =>
      ddbDocClient.send(
        new DeleteCommand({
          TableName: backendConfig.templatesTableName,
          Key: {
            owner: `CLIENT#${clientId}`,
            id,
          },
        })
      )
    )
  );

  const testUserClient = new TestUserClient(
    backendConfig.userPoolId,
    backendConfig.clientSsmPathPrefix
  );

  await Promise.all(
    Object.values(users).map(({ email, clientId }) =>
      testUserClient.deleteTestUser(email, clientId)
    )
  );
};

teardown();
