import { writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { TestUserClient } from './test-user-client';
import { generate } from 'generate-password';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { LetterTemplate } from 'nhs-notify-web-template-management-utils';
import { VirusScanStatus } from 'nhs-notify-backend-client';
import { BackendConfigHelper } from 'nhs-notify-web-template-management-util-backend-config';
import path from 'node:path';

// pa11y can't interact with a file upload dialogue, so letters must be seeded
const generateLetterTemplateData = (
  name: string,
  owner: string,
  virusScanStatus: VirusScanStatus
): LetterTemplate & { owner: string } => {
  const now = new Date().toISOString();

  return {
    name,
    owner,
    id: randomUUID(),
    templateType: 'LETTER',
    letterType: 'x0',
    language: 'en',
    createdAt: now,
    updatedAt: now,
    files: {
      pdfTemplate: {
        fileName: 'template.pdf',
        currentVersion: randomUUID(),
        virusScanStatus,
      },
      testDataCsv: {
        fileName: 'test-data.csv',
        currentVersion: randomUUID(),
        virusScanStatus,
      },
    },
    templateStatus: 'NOT_YET_SUBMITTED',
  };
};

const setup = async () => {
  const backendConfig = BackendConfigHelper.fromTerraformOutputsFile(
    path.join(__dirname, '..', '..', 'sandbox_tf_outputs.json')
  );

  const testEmail = `nhs-notify-automated-test-accessibility-test-${randomUUID()}@nhs.net`;
  const testPassword = generate({
    length: 20,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
    strict: true,
  });

  const testUserClient = new TestUserClient(backendConfig.userPoolId);

  const { userId } = await testUserClient.createTestUser(
    testEmail,
    testPassword
  );

  const ddbDocClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: 'eu-west-2' })
  );

  const templates = [
    generateLetterTemplateData(
      'pa11y-letter-passed-virus-check',
      userId,
      'PASSED'
    ),
    generateLetterTemplateData(
      'pa11y-letter-pending-virus-check',
      userId,
      'PENDING'
    ),
  ];

  await Promise.all(
    templates.map((template) =>
      ddbDocClient.send(
        new PutCommand({
          TableName: backendConfig.templatesTableName,
          Item: template,
        })
      )
    )
  );

  const templateIds = Object.fromEntries(templates.map((t) => [t.name, t.id]));

  const fixtureData = {
    email: testEmail,
    password: testPassword,
    templateIds,
    userId,
  };

  writeFileSync('./pa11y-fixtures.json', JSON.stringify(fixtureData, null, 2));
};

setup();
