import {
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.REGION,
  retryMode: 'standard',
  maxAttempts: 10,
});

export async function writeJsonToFile(
  path: string,
  content: string,
  bucket: string
): Promise<PutObjectCommandOutput> {
  return s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: path,
      Body: content,
      ContentType: 'application/json',
    })
  );
}
