/* eslint-disable security/detect-non-literal-fs-filename */
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { Parameters } from '@/src/utils/constants';
import { getAccountId } from '@/src/utils/sts-utils';
import { writeJsonToFile } from '@/src/utils/s3-utils';

export async function backupData(
  items: Record<string, AttributeValue>[],
  parameters: Parameters
): Promise<void> {
  console.log(`Found ${items.length} results`);
  if (items.length <= 0) {
    return;
  }

  const { environment, sourceOwner, destinationOwner } = parameters;
  const accountId = await getAccountId();
  const bucketName = `nhs-notify-${accountId}-eu-west-2-main-acct-migration-backup`;

  const timestamp = new Date().toISOString().replaceAll(/[.:T-]/g, '_');
  const filePath = `user-transfer/${environment}/${timestamp}-source-${sourceOwner}-destination-${destinationOwner}.json`;
  await writeJsonToFile(filePath, JSON.stringify(items), bucketName);
  console.log(`Backed up data to s3://${bucketName}/${filePath}`);
}
