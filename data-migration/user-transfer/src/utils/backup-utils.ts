import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { Parameters } from '@/src/utils/constants';
import { getAccountId } from '@/src/utils/sts-utils';
import { writeJsonToFile } from '@/src/utils/s3-utils';
import fs from 'node:fs';
import { UserData } from './cognito-utils';

export async function backupData(
  items: Record<string, AttributeValue>[],
  parameters: Parameters
): Promise<void> {
  console.log(`Found ${items.length} results`);
  if (items.length <= 0) {
    return;
  }

  const { environment } = parameters;
  const accountId = await getAccountId();
  const bucketName = `nhs-notify-${accountId}-eu-west-2-main-acct-migration-backup`;

  const timestamp = new Date().toISOString().replaceAll(/[.:T-]/g, '_');
  const filePath = `ownership-transfer/templates/templates-list/${environment}/${timestamp}.json`;
  await writeJsonToFile(filePath, JSON.stringify(items), bucketName);
  console.log(`Backed up data to s3://${bucketName}/${filePath}`);
}

export async function backupToJSON(userData: UserData[]) {
  const userDataJSON = JSON.stringify(userData);

  fs.writeFile('users.json', userDataJSON, (err) => {
    if (err) {
      console.log('Error writing file:', err);
    } else {
      console.log('Successfully wrote file');
    }
  });
}

export async function readJSONFile(filePath: string) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const users = fs.readFileSync(filePath, 'utf8');

  return JSON.parse(users);
}

export async function deleteJSONFile(filePath: string) {
  fs.access(filePath, (error) => {
    if (error) {
      console.error('Error occurred:', error);
    } else {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.unlinkSync(filePath);
      console.log('File deleted successfully');
    }
  });
}
