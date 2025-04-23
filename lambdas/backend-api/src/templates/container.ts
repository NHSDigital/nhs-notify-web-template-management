import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { TemplateClient } from './app/template-client';
import { TemplateRepository } from './infra';
import { LetterUploadRepository } from './infra/letter-upload-repository';
import { ProofingQueue } from './infra/proofing-queue';
import { SQSClient } from '@aws-sdk/client-sqs';
import { loadConfig } from './infra/config';

export function createContainer() {
  const config = loadConfig();

  if (!config.templatesTableName) {
    throw new Error('process.env.QUARANTINE_BUCKET_NAME is undefined');
  }

  const ddbDocClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: 'eu-west-2' }),
    {
      marshallOptions: { removeUndefinedValues: true },
    }
  );

  const sqsClient = new SQSClient({ region: 'eu-west-2' });

  const templateRepository = new TemplateRepository(
    ddbDocClient,
    config.templatesTableName,
    config.enableProofing
  );

  const letterUploadRepository = new LetterUploadRepository(
    config.quarantineBucket,
    config.internalBucket
  );

  const proofingQueue = new ProofingQueue(
    sqsClient,
    config.requestProofQueueUrl
  );

  const templateClient = new TemplateClient(
    config.enableLetters,
    templateRepository,
    letterUploadRepository,
    proofingQueue,
    config.defaultLetterSupplier
  );

  return {
    templateClient,
    templateRepository,
    letterUploadRepository,
  };
}
