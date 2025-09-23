/* eslint-disable unicorn/no-zero-fractions */
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import {
  deleteItem,
  retrieveAllTemplates,
  updateItem,
} from '@/src/utils/ddb-utils';
import {
  backupData,
  backupToJSON,
  deleteJSONFile,
  readJSONFile,
} from '@/src/utils/backup-utils';
import { Parameters } from '@/src/utils/constants';
import {
  getUserGroupAndClientId,
  listCognitoUsers,
  UserData,
} from './utils/cognito-utils';
import { backupObject, handleS3Copy, handleS3Delete } from './utils/s3-utils';

const DRY_RUN = true;

function getParameters(): Parameters {
  return yargs(hideBin(process.argv))
    .options({
      environment: {
        type: 'string',
        demandOption: true,
      },
      component: {
        type: 'string',
        demandOption: true,
      },
      accessKeyId: {
        type: 'string',
        demandOption: true,
      },
      secretAccessKey: {
        type: 'string',
        demandOption: true,
      },
      userPoolId: {
        type: 'string',
        demandOption: true,
      },
      sessionToken: {
        type: 'string',
        demandOption: true,
      },
      region: {
        type: 'string',
        demandOption: true,
      },
      flag: {
        type: 'string',
        demandOption: false,
      },
    })
    .parseSync();
}

async function getUserData(parameters: Parameters) {
  const usernames = await listCognitoUsers(parameters);
  if (!usernames || usernames.length === 0) {
    throw new Error('No users found');
  }
  const userGroupAndClientId = await getUserGroupAndClientId(
    usernames as string[],
    parameters
  );
  // download users to a json file
  await backupToJSON(userGroupAndClientId);
}

async function migrateTemplatesAndS3Data(
  items: Record<string, AttributeValue>[],
  parameters: Parameters
): Promise<void> {
  const users: UserData[] = await readJSONFile('users.json');

  for (const user of users) {
    for (const item of items) {
      const { id, owner, templateType } = item;
      if (owner.S === user.userId) {
        // copy s3 data
        if (templateType.S === 'LETTER') {
          await handleS3Copy(user, id.S as string, DRY_RUN);
        }

        // migrate templates
        await updateItem(item, parameters, user, DRY_RUN);

        // delete previous template
        await deleteItem(item, parameters);

        // delete migrated s3 data
        if (templateType.S === 'LETTER') {
          await handleS3Delete(user, id.S as string, DRY_RUN);
        }
      }
    }
  }

  await deleteJSONFile('users.json');
  console.log('Migration completed successfully');
}

export async function performTransfer() {
  const parameters = getParameters();

  // if flag = user, then, get cognito users with their clientId and save to a json file
  if (parameters.flag && parameters.flag === 'user') {
    await getUserData(parameters);
  }

  // retrieve and backup all templates
  const items = await retrieveAllTemplates(parameters);
  await backupData(items, parameters);

  // retrieve and backup  all S3 data
  await backupObject(parameters);

  // Migrate
  await migrateTemplatesAndS3Data(items, parameters);
}
