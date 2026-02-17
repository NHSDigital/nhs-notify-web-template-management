import { readFileSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import type { InitialRenderRequest } from 'nhs-notify-backend-client/src/types/render-request';
import type { DatabaseTemplate } from 'nhs-notify-web-template-management-utils';

const CONFIG = {
  tableName: 'nhs-notify-alnu1-sbx-api-templates',

  queueUrl: 'https://sqs.eu-west-2.amazonaws.com/891377170468/nhs-notify-alnu1-sbx-letter-render-queue.fifo',

  bucketName: 'nhs-notify-891377170468-eu-west-2-alnu1-sbx-internal',

  templateId: '745BB809-6CB2-4E8A-AF0B-DC7AEB61C6F2',
  clientId: '21d8beea-e15c-489a-8327-15dbb303c9d2',

  docxPath:
    'lambdas/letter-preview-renderer/src/__tests__/fixtures/standard-english-template.docx',
};

async function main() {
  validateConfig();

  const templateId = CONFIG.templateId || randomUUID();
  const clientId = CONFIG.clientId || 'test-client';

  console.log('Configuration:');
  console.log(`  Table:      ${CONFIG.tableName}`);
  console.log(`  Queue:      ${CONFIG.queueUrl}`);
  console.log(`  Bucket:     ${CONFIG.bucketName}`);
  console.log(`  TemplateId: ${templateId}`);
  console.log(`  ClientId:   ${clientId}`);
  console.log();

  const ddbClient = new DynamoDBClient({});
  const ddb = DynamoDBDocumentClient.from(ddbClient);
  const s3 = new S3Client({});
  const sqs = new SQSClient({});

  console.log('1. Uploading DOCX to S3...');
  await uploadDocx(s3, templateId, clientId);
  console.log('   Done.');

  console.log('2. Creating template record in DynamoDB...');
  await createTemplate(ddb, templateId, clientId);
  console.log('   Done.');

  console.log('3. Sending render request to SQS...');
  const messageId = await sendRenderRequest(sqs, templateId, clientId);
  console.log(`   Done. MessageId: ${messageId}`);

  console.log();
  console.log('Render triggered successfully!');
  console.log(`Watch the Lambda logs for templateId: ${templateId}`);
}

function validateConfig() {
  const required: (keyof typeof CONFIG)[] = [
    'tableName',
    'queueUrl',
    'bucketName',
  ];

  const missing = required.filter((key) => !CONFIG[key]);

  if (missing.length > 0) {
    console.error('Missing required configuration:');
    for (const key of missing) console.error(`  - ${key}`);
    console.error('\nPlease fill in the CONFIG object in this script.');
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
}

async function uploadDocx(
  s3: S3Client,
  templateId: string,
  clientId: string
): Promise<void> {
  const repoRoot = path.resolve(__dirname, '../../..');
  const docxFullPath = path.resolve(repoRoot, CONFIG.docxPath);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const docxContent = readFileSync(docxFullPath);

  const s3Key = `${clientId}/letter-source/${templateId}/${templateId}.docx`;

  await s3.send(
    new PutObjectCommand({
      Bucket: CONFIG.bucketName,
      Key: s3Key,
      Body: docxContent,
      ContentType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
  );

  console.log(`   S3 key: ${s3Key}`);
}

async function createTemplate(
  ddb: DynamoDBDocumentClient,
  templateId: string,
  clientId: string
): Promise<void> {
  const now = new Date().toISOString();

  const template: DatabaseTemplate = {
    id: templateId,
    owner: `CLIENT#${clientId}`,
    clientId,

    templateType: 'LETTER',
    letterType: 'x0',
    language: 'en',
    letterVersion: 'AUTHORING',

    templateStatus: 'NOT_YET_SUBMITTED',

    files: {},

    name: 'Test Letter Template (trigger-render script)',
    version: 1,
    lockNumber: 0,
    createdAt: now,
    updatedAt: now,
    createdBy: 'SCRIPT#trigger-render',
    updatedBy: 'SCRIPT#trigger-render',
  };

  await ddb.send(
    new PutCommand({
      TableName: CONFIG.tableName,
      Item: template,
    })
  );
}

async function sendRenderRequest(
  sqs: SQSClient,
  templateId: string,
  clientId: string
): Promise<string> {
  const request: InitialRenderRequest = {
    requestType: 'initial',
    template: {
      templateId,
      clientId,
    },
  };

  const result = await sqs.send(
    new SendMessageCommand({
      QueueUrl: CONFIG.queueUrl,
      MessageBody: JSON.stringify(request),
    })
  );

  return result.MessageId ?? 'unknown';
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch((error) => {
  console.error('Script failed:', error);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
});
