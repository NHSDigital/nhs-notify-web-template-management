import { readFileSync } from 'node:fs';
import { TestUserClient } from './test-user-client';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { BackendConfigHelper } from 'nhs-notify-web-template-management-util-backend-config';
import path from 'node:path';

const { email, templateIds, userId } = JSON.parse(
  readFileSync('./pa11y-fixtures.json', 'utf8')
);

const teardown = async () => {
  const ddbDocClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: 'eu-west-2' })
  );

  const backendConfig = BackendConfigHelper.fromTerraformOutputsFile(
    path.join(__dirname, '..', '..', 'sandbox_tf_outputs.json')
  );

  await Promise.all(
    Object.values(templateIds).map((id) =>
      ddbDocClient.send(
        new DeleteCommand({
          TableName: backendConfig.templatesTableName,
          Key: {
            owner: userId,
            id,
          },
        })
      )
    )
  );

  await new TestUserClient(backendConfig.userPoolId).deleteTestUser(email);
};

teardown();
