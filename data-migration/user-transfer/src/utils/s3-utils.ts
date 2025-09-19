import {
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
  NotFound,
  paginateListObjectsV2,
  HeadObjectCommand,
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

async function listItemObjectsWithPaginator(bucket: string) {
  const itemObjects = [];
  const paginatedItemObjects = paginateListObjectsV2(
    {
      client: s3Client,
      pageSize: 1000,
    },
    { Bucket: bucket }
  );

  for await (const page of paginatedItemObjects) {
    if (page.Contents) {
      itemObjects.push(...page.Contents.map((item) => item.Key));
    }
  }

  return itemObjects.length > 0 ? itemObjects : [];
}

export async function getItemObjects(
  templateId: string
): Promise<unknown | void> {
  try {
    const items = await listItemObjectsWithPaginator(sourceBucket as string);

    if (items.length > 0) {
      const itemObjects = items.filter((item) => item.includes(templateId));
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
  clientId: string
) {
  const destinationKey = sourceKey.replace(owner, clientId);

  // Get existing metadata
  const head = await s3Client.send(
    new HeadObjectCommand({
      Bucket: sourceBucket,
      Key: sourceKey,
    })
  );

  const existingMetadata = head.Metadata || {};

  // 2. Update just the one key necessary
  const { ['owner']: _, ...rest } = existingMetadata;
  const updatedMetadata = {
    ...rest,
    ['client-id']: clientId,
  };
  return await s3Client.send(
    new CopyObjectCommand({
      CopySource: `${sourceBucket}/${sourceKey}`,
      Bucket: sourceBucket,
      Key: destinationKey,
      Metadata: updatedMetadata,
      MetadataDirective: 'REPLACE',
      TaggingDirective: 'COPY',
      ContentType: head.ContentType,
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

  const items = await listItemObjectsWithPaginator(sourceBucket as string);

  console.log(`Found ${items.length} objects in S3`);

  for (const item of items) {
    await s3Client.send(
      new CopyObjectCommand({
        Bucket: bucketName,
        Key: key + item,
        CopySource: `${sourceBucket}/${item}`,
        MetadataDirective: 'COPY',
      })
    );
  }

  console.log('Object backup successful');
}
