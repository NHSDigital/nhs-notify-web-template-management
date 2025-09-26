import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { getAccountId } from './sts-utils';
import { writeFile } from './s3-utils';
import fs from 'node:fs';

export const backupBucketName = async () => {
  const accountId = await getAccountId();
  return `nhs-notify-${accountId}-eu-west-2-main-acct-migration-backup`;
};

export async function backupData(
  items: Record<string, AttributeValue>[],
  bucketName: string,
  path: string
): Promise<void> {
  console.log(`Found ${items.length} results`);
  if (items.length <= 0) {
    return;
  }

  const timestamp = new Date().toISOString().replaceAll(/[.:T-]/g, '_');
  const filePath = `${path}/${timestamp}.json`;
  await writeFile(filePath, JSON.stringify(items), bucketName);
  console.log(`Backed up data to s3://${bucketName}/${filePath}`);
}

export function writeLocal(filename: string, data: string) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFile(filename, data, (err: unknown) => {
    if (err) {
      console.log(`Error writing file: ${filename}`, err);
    } else {
      console.log(`Successfully wrote ${filename}`);
    }
  });
}
