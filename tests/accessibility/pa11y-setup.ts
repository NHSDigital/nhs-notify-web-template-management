import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { generate } from 'generate-password';
import {
  TemplateStatus,
  TemplateType,
  VirusScanStatus,
} from 'nhs-notify-backend-client';
import { LetterTemplate } from 'nhs-notify-web-template-management-utils';
import { BackendConfigHelper } from 'nhs-notify-web-template-management-util-backend-config';
import { TestUserClient } from './test-user-client';
import type { FixtureData } from './types';

// pa11y can't interact with a file upload dialogue, so letters must be seeded
const generateLetterTemplateData = (
  name: string,
  clientId: string,
  virusScanStatus: VirusScanStatus,
  templateStatus: TemplateStatus
): LetterTemplate & { owner: string } => {
  const now = new Date().toISOString();

  return {
    name,
    owner: `CLIENT#${clientId}`,
    clientId,
    id: randomUUID(),
    templateType: 'LETTER',
    letterType: 'x0',
    language: 'en',
    createdAt: now,
    updatedAt: now,
    proofingEnabled: true,
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
      ...(['PROOF_AVAILABLE', 'SUBMITTED'].includes(templateStatus) && {
        proofs: {
          proof1: {
            fileName: 'proof1.pdf',
            supplier: 'WTMMOCK',
            virusScanStatus: 'PASSED',
          },
          proof2: {
            fileName: 'proof2.pdf',
            supplier: 'WTMMOCK',
            virusScanStatus: 'PASSED',
          },
          proof3: {
            fileName: 'proof3.pdf',
            supplier: 'WTMMOCK',
            virusScanStatus: 'PASSED',
          },
        },
      }),
    },
    templateStatus,
  };
};

const generateDigitalTemplateData = (
  name: string,
  clientId: string,
  templateType: TemplateType,
  templateStatus: TemplateStatus
) => {
  const now = new Date().toISOString();

  return {
    name,
    message: 'template-message',
    owner: `CLIENT#${clientId}`,
    clientId,
    id: randomUUID(),
    templateType,
    createdAt: now,
    updatedAt: now,
    templateStatus,
    ...(templateType === 'EMAIL' && {
      subject: 'template-subject',
    }),
  };
};

const setupTestUser = async (
  testUserClient: TestUserClient,
  clientId: string,
  clientName: string
) => {
  const email = `nhs-notify-automated-test-accessibility-test-${randomUUID()}@nhs.net`;
  const password = generate({
    length: 20,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
    strict: true,
  });

  const { userId } = await testUserClient.createTestUser(
    email,
    password,
    clientId,
    clientName
  );

  return {
    email,
    password,
    userId,
    clientId,
  };
};

const getTestTemplates = (clientId: string) => [
  generateLetterTemplateData(
    'pa11y-letter-pending-virus-check',
    clientId,
    'PENDING',
    'PENDING_UPLOAD'
  ),
  generateLetterTemplateData(
    'pa11y-letter-failed-virus-check',
    clientId,
    'FAILED',
    'VIRUS_SCAN_FAILED'
  ),
  generateLetterTemplateData(
    'pa11y-letter-pending-validation',
    clientId,
    'PASSED',
    'PENDING_VALIDATION'
  ),
  generateLetterTemplateData(
    'pa11y-letter-failed-validation',
    clientId,
    'PASSED',
    'VALIDATION_FAILED'
  ),
  generateLetterTemplateData(
    'pa11y-letter-passed-validation',
    clientId,
    'PASSED',
    'PENDING_PROOF_REQUEST'
  ),
  generateLetterTemplateData(
    'pa11y-letter-proof-requested',
    clientId,
    'PASSED',
    'WAITING_FOR_PROOF'
  ),
  generateLetterTemplateData(
    'pa11y-letter-proof-available',
    clientId,
    'PASSED',
    'PROOF_AVAILABLE'
  ),
  generateLetterTemplateData(
    'pa11y-letter-proof-submitted',
    clientId,
    'PASSED',
    'SUBMITTED'
  ),
  generateDigitalTemplateData(
    'pa11y-email-proof-submitted',
    clientId,
    'EMAIL',
    'SUBMITTED'
  ),
  generateDigitalTemplateData(
    'pa11y-sms-proof-submitted',
    clientId,
    'SMS',
    'SUBMITTED'
  ),
  generateDigitalTemplateData(
    'pa11y-nhsapp-proof-submitted',
    clientId,
    'NHS_APP',
    'SUBMITTED'
  ),
];

const setup = async () => {
  const backendConfig = BackendConfigHelper.fromTerraformOutputsFile(
    path.join(__dirname, '..', '..', 'sandbox_tf_outputs.json')
  );

  const mainClientId = 'accessibility-test-client';
  const routingClientId = 'routing-accessibility-test-client';

  const testUserClient = new TestUserClient(
    backendConfig.userPoolId,
    backendConfig.clientSsmPathPrefix
  );

  const mainUser = await setupTestUser(
    testUserClient,
    mainClientId,
    'NHS Accessibility'
  );

  const routingUser = await setupTestUser(
    testUserClient,
    routingClientId,
    'NHS Routing Accessibility'
  );

  const ddbDocClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: 'eu-west-2' })
  );

  const templateIdsList = await Promise.all(
    [mainClientId, routingClientId].map(async (clientId) => {
      const templatesForClient = getTestTemplates(clientId);

      await Promise.all(
        templatesForClient.map((template) =>
          ddbDocClient.send(
            new PutCommand({
              TableName: backendConfig.templatesTableName,
              Item: template,
            })
          )
        )
      );

      return [
        clientId,
        Object.fromEntries(
          templatesForClient.map((template) => [
            template.templateStatus,
            template.id,
          ])
        ),
      ];
    })
  );

  const templateIds = Object.fromEntries(templateIdsList);

  const fixtureData: FixtureData = {
    users: {
      mainUser,
      routingUser,
    },
    templateIds,
  };

  writeFileSync('./pa11y-fixtures.json', JSON.stringify(fixtureData, null, 2));
};

setup();
