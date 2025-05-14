/* eslint-disable security/detect-non-literal-fs-filename */
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { Parameters } from '@/src/user-transfer';

const backupDir = './backups';

function createBackupDir() {
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir);
  }
}

export function backupData(
  items: Record<string, AttributeValue>[],
  parameters: Parameters
) {
  const { environment, sourceOwner, destinationOwner } = parameters;
  createBackupDir();
  console.log(`Found ${items.length} results`);
  const fileName = `usr_tsfr-${new Date().toISOString()}-env-${environment}-src-${sourceOwner}-dest-${destinationOwner}.json`;
  writeFileSync(`${backupDir}/${fileName}`, JSON.stringify(items));
  console.log(`Backed up data locally to ${fileName}`);
}
