import { S3Client } from '@aws-sdk/client-s3';

export const createContainer = () => {
  const s3Client = new S3Client({});
  return { s3Client };
};

export type Container = ReturnType<typeof createContainer>;