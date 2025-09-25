import {
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
  paginateListObjectsV2,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { Parameters } from '@/src/utils/constants';
import { getAccountId } from './sts-utils';
import { UserData } from './cognito-utils';
import { print } from './log';

const s3Client = new S3Client({
  region: 'eu-west-2',
  retryMode: 'standard',
  maxAttempts: 10,
});

// this is to be changed to prod bucket
const sourceBucket = process.env.BUCKET_NAME;

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

export async function listItemObjectsWithPaginator(bucket: string) {
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
      itemObjects.push(...page.Contents.map((item) => item.Key!));
    }
  }

  return itemObjects.length > 0 ? itemObjects : [];
}

export async function getItemObjects(templateId: string): Promise<string[]> {
  const items = await listItemObjectsWithPaginator(sourceBucket as string);
  const itemObjects = items.filter((item) => item.includes(templateId));
  return itemObjects;
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
  try {
    await s3Client.send(
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
    console.log('S3 object migration was successful');
    return 'success';
  } catch {
    throw new Error('Unable to migrate data');
  }
}

export async function copyObjectsV2(
  bucket: string,
  sourceKey: string,
  destinationKey: string,
  clientId: string,
  dryRun = true
) {
  const head = await s3Client.send(
    new HeadObjectCommand({
      Bucket: bucket,
      Key: sourceKey,
    })
  );

  const { ['owner']: _, ...metadataWithoutOwner } = head.Metadata || {};

  if (dryRun) {
    print(`[DRY RUN] S3: transfer ${sourceKey} to ${destinationKey}`);
    return;
  }

  try {
    await s3Client.send(
      new CopyObjectCommand({
        CopySource: `${bucket}/${sourceKey}`,
        Bucket: bucket,
        Key: destinationKey,
        Metadata: {
          ...metadataWithoutOwner,
          'client-id': clientId,
        },
        MetadataDirective: 'REPLACE',
        TaggingDirective: 'COPY',
        ContentType: head.ContentType,
      })
    );
    print(`S3: transfer successful`);
  } catch (error) {
    throw new Error(`Failed copying ${sourceKey} to ${destinationKey}`, {
      cause: error,
    });
  }
}

export async function deleteObjects(key: string, dryRun = true) {
  if (dryRun) {
    console.log(`[DRY RUN] S3: will delete ${key}`);
  } else {
    return await s3Client.send(
      new DeleteObjectCommand({
        Bucket: sourceBucket,
        Key: key,
      })
    );
  }
}

export async function deleteObjectsV2(
  bucket: string,
  key: string,
  dryRun = true
) {
  if (dryRun) {
    print(`[DRY RUN] S3: will delete ${key}`);
    return;
  }

  try {
    return await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  } catch (error) {
    throw new Error(`Failed deleting ${key}`, {
      cause: error,
    });
  }
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
export async function handleS3Copy(
  user: UserData,
  templateId: string,
  DRY_RUN: boolean = false
) {
  const itemObjects = await getItemObjects(templateId);
  for (const itemObject of itemObjects) {
    const sourceKey = itemObject;
    const destinationKey = sourceKey.replace(user.userId, user.clientId);
    if (DRY_RUN) {
      console.log(
        `[DRY_RUN] Would migrate S3 object: ${sourceBucket}/${sourceKey} -> ${sourceBucket}/${destinationKey}`
      );
    } else {
      await copyObjects(user.userId, sourceKey, user.clientId);
    }
  }
}
export async function handleS3Delete(
  user: UserData,
  templateId: string,
  DRY_RUN: boolean = false
) {
  const itemObjects = await getItemObjects(templateId);
  for (const itemObject of itemObjects) {
    const sourceKey = itemObject;
    if (DRY_RUN) {
      console.log(
        `[DRY_RUN] Would delete S3 object: ${sourceBucket}/${sourceKey}`
      );
    } else {
      await deleteObjects(sourceKey);
    }
  }
}
