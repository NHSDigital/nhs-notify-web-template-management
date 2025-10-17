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

  const clientId = 'accessibility-test-client';

  const clientName = 'NHS Accessibility';

  const testUserClient = new TestUserClient(
    backendConfig.userPoolId,
    backendConfig.clientSsmPathPrefix
  );

  const givenName = 'Orval';
  const familyName = 'Bergstrom';
  const userName = ['Dr', givenName, familyName];

  const { userId } = await testUserClient.createTestUser(
    testEmail,
    testPassword,
    clientId,
    clientName
  );

  const ddbDocClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: 'eu-west-2' })
  );

  const templates = [
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

  const templateIds = Object.fromEntries(
    templates.map((t) => [t.templateStatus, t.id])
  );

  const fixtureData = {
    email: testEmail,
    password: testPassword,
    templateIds,
    userId,
    clientId,
    clientName,
    userName,
  };

  writeFileSync('./pa11y-fixtures.json', JSON.stringify(fixtureData, null, 2));
};

setup();
