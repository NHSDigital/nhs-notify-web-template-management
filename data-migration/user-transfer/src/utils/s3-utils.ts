import {
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
  paginateListObjectsV2,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'eu-west-2',
  retryMode: 'standard',
  maxAttempts: 10,
});

export async function listAllFiles(bucket: string) {
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

  return itemObjects;
}

export async function writeFile(
  path: string,
  content: string,
  bucket: string,
  contentType = 'application/json'
): Promise<PutObjectCommandOutput> {
  return s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: path,
      Body: content,
      ContentType: contentType,
    })
  );
}

export async function deleteFile(bucket: string, key: string) {
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

export async function getFileHead(bucket: string, key: string) {
  return await s3Client.send(
    new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

export async function transferFileToNewBucket(
  sourceBucket: string,
  destinationBucket: string,
  source: string,
  destination: string
) {
  await s3Client.send(
    new CopyObjectCommand({
      CopySource: `${sourceBucket}/${source}`,
      Bucket: destinationBucket,
      Key: destination,
      MetadataDirective: 'COPY',
      TaggingDirective: 'COPY',
    })
  );
}

export async function transferFileToClient(
  bucket: string,
  source: string,
  destination: string,
  clientId: string
) {
  const head = await getFileHead(bucket, source);

  const { ['owner']: _, ...metadataWithoutOwner } = head.Metadata || {};

  try {
    await s3Client.send(
      new CopyObjectCommand({
        CopySource: `${bucket}/${source}`,
        Bucket: bucket,
        Key: destination,
        Metadata: {
          ...metadataWithoutOwner,
          'client-id': clientId,
        },
        MetadataDirective: 'REPLACE',
        TaggingDirective: 'COPY',
        ContentType: head.ContentType,
      })
    );
  } catch (error) {
    throw new Error(`Failed copying ${source} to ${destination}`, {
      cause: error,
    });
  }
}
