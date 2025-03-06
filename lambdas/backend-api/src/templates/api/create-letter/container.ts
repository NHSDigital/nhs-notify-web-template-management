import { S3Client } from '@aws-sdk/client-s3';
import { TemplateClient } from '@backend-api/templates/app/template-client';
import { randomUUID } from 'node:crypto';

export const createContainer = () => {
  const s3Client = new S3Client({ region: 'eu-west-2' });

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const generateSuffixId = () => randomUUID();

  const templateClient = new TemplateClient(
    process.env.ENABLE_LETTERS_BACKEND === 'true'
  );

  const quarantineBucketName = process.env.QUARANTINE_BUCKET_NAME;

  if (!quarantineBucketName) {
    throw new Error('QUARANTINE_BUCKET_NAME');
  }

  return {
    s3Client,
    templateClient,
    generateSuffixId,
    quarantineBucketName,
  };
};
