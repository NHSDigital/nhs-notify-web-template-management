import { getAccountId } from '@/src/utils/aws/sts-utils';
import { writeJsonToFile } from '@/src/utils/aws/s3-util';

export function getTimestamp(): string {
  return new Date().toISOString().replaceAll(/[.:T-]/g, '');
}

export async function backupDataToS3(data: unknown, env: string) {
  const accountId = await getAccountId();
  const timestamp = getTimestamp();
  const path = `user-identifiers/${env}/${timestamp}.json`;
  const backupBucket = `nhs-notify-${accountId}-eu-west-2-main-acct-migration-backup`;
  await writeJsonToFile(path, JSON.stringify(data, null, 2), backupBucket);
}
