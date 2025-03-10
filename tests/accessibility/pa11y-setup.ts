import { writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { TestUserClient } from './test-user-client';
import { generate } from 'generate-password';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import {
  LetterTemplate,
  TemplateType,
} from 'nhs-notify-web-template-management-utils';
import {
  Language,
  LetterType,
  TemplateStatus,
  VirusScanStatus,
} from 'nhs-notify-backend-client';

const setup = async () => {
  const testEmail = `nhs-notify-automated-test-accessibility-test-${randomUUID()}@nhs.net`;
  const testPassword = generate({
    length: 20,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
    strict: true,
  });

  const testUserClient = new TestUserClient('./frontend');

  const { userId } = await testUserClient.createTestUser(
    testEmail,
    testPassword
  );

  const ddbDocClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: 'eu-west-2' })
  );

  const templateId = randomUUID();

  await ddbDocClient.send(
    new PutCommand({
      TableName: process.env.TEMPLATES_TABLE_NAME,
      Item: {
        owner: userId,
        templateType: 'LETTER',
        id: templateId,
        letterType: LetterType.X0,
        language: 'en',
        createdAt: new Date().toISOString(),
        name: 'pa11y_letter',
        files: {
          pdfTemplate: {
            fileName: 'template.pdf',
            currentVersion: randomUUID(),
            virusScanStatus: VirusScanStatus.PENDING,
          },
          testDataCsv: {
            fileName: 'test-data.csv',
            currentVersion: randomUUID(),
            virusScanStatus: VirusScanStatus.PENDING,
          },
        },
        templateStatus: 'NOT_YET_SUBMITTED',
      } satisfies LetterTemplate & { owner: string },
    })
  );

  writeFileSync(
    './pa11y-fixtures.json',
    JSON.stringify({
      email: testEmail,
      password: testPassword,
      templateId,
      userId,
    })
  );
};

setup();
