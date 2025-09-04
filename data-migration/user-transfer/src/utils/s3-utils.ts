import {
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
  NotFound,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { Parameters } from '@/src/utils/constants';
import { getAccountId } from './sts-utils';

const s3Client = new S3Client({
  region: process.env.REGION,
  retryMode: 'standard',
  maxAttempts: 10,
});

// this is to be changed to prod bucket
const sourceBucket = process.env.BUCKET_NAME; // 'nhs-notify-891377170468-eu-west-2-musa3-sbx-internal'

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

export async function getItemObjects(
  templateId: string
): Promise<unknown | void> {
  try {
    const items = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: sourceBucket,
      })
    );

    if (items.Contents && items.Contents.length > 0) {
      const itemObjects = items.Contents?.filter((item) =>
        item['Key']?.includes(templateId)
      );
      return itemObjects;
    } else {
      throw Error;
    }
  } catch (error) {
    if (error instanceof NotFound) {
      return;
    }

    throw error;
  }
}

export async function copyObjects(
  owner: string,
  sourceKey: string,
  templateId: string,
  versionId: string,
  clientId: string
) {
  const destinationKey = sourceKey.replace(owner, clientId);
  console.log({ sourceKey, destinationKey });
  return await s3Client.send(
    new CopyObjectCommand({
      CopySource: `${sourceBucket}/${sourceKey}`,
      Bucket: sourceBucket,
      Key: destinationKey,
      Metadata: {
        'client-id': clientId,
        'file-type': 'pdf-template',
        'template-id': templateId,
        'version-id': versionId,
      },
      MetadataDirective: 'REPLACE',
      TaggingDirective: 'COPY',
    })
  );
}

export async function deleteObjects(key: string) {
  return await s3Client.send(
    new DeleteObjectCommand({
      Bucket: sourceBucket,
      Key: key,
    })
  );
}

export async function backupObject(parameters: Parameters) {
  const { environment } = parameters;
  const accountId = await getAccountId();
  const bucketName = `nhs-notify-${accountId}-eu-west-2-main-acct-migration-backup`;
  const key = `ownership-transfer/templates/s3-objects/${environment}/`;

  const items = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: sourceBucket,
    })
  );

  if (items['Contents'] && items['Contents'].length <= 0) {
    return;
  }

  console.log(`Found ${items['Contents']?.length} objects in S3`);

  for (const item of items['Contents']) {
    await s3Client.send(
      new CopyObjectCommand({
        Bucket: bucketName,
        Key: key + item.Key,
        CopySource: `${sourceBucket}/${item.Key}`,
        MetadataDirective: 'COPY',
      })
    );
  }

  console.log('Object backup successful');
}
