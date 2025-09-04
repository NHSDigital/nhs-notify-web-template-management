/* eslint-disable unicorn/no-zero-fractions */
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import {
  deleteItem,
  retrieveAllTemplates,
  updateItem,
} from '@/src/utils/ddb-utils';
import { backupData } from '@/src/utils/backup-utils';
import { Parameters } from '@/src/utils/constants';
import { findCognitoUser, getUserGroup } from './utils/cognito-utils';
import {
  backupObject,
  copyObjects,
  deleteObjects,
  getItemObjects,
} from './utils/s3-utils';

function getParameters(): Parameters {
  return yargs(hideBin(process.argv))
    .options({
      environment: {
        type: 'string',
        demandOption: true,
      },
    })
    .parseSync();
}

async function updateItems(
  items: Record<string, AttributeValue>[],
  parameters: Parameters
): Promise<void> {
  for (const item of items) {
    console.log(item.owner.S);

    // Get owner id of this item
    const { owner, id, templateType, clientId } = item;

    //check if owner doesn't have CLIENT#
    if (owner.S && !owner.S?.includes('CLIENT#')) {
      // check the user in cognito, if it exist then pull the client id
      const cognitoUser = await findCognitoUser(owner.S);

      // check and get user groups - this is used when migrating for production
      const userClientIdFromGroup = await getUserGroup({
        Username: cognitoUser?.username,
        UserPoolId: cognitoUser?.poolId,
      });

      // resolve client id
      const newClientId = (userClientIdFromGroup ??
        cognitoUser?.clientIdAttr) as string;

      // check if this item has a client id, if yes check it matches the client id above. If it doesn't, throw error!
      if (item.clientId && item.clientId.S !== newClientId) {
        console.log({
          templateClientId: item.clientId,
          cognitoClientId: newClientId,
        });

        throw new Error('Invalid ids');
      }
      // if it matches make the required swaps (clientId, createdby and updatedby)
      // if item doesn't have a client id then create one and do the above
      // update the item and delete the previous one
      await Promise.all([
        updateItem(item, parameters, newClientId),
        deleteItem(item, parameters),
      ]);
    }

    //
    if (templateType.S === 'LETTER') {
      //Retrieve item S3 object(s)
      const itemObjects = await getItemObjects(id.S as string);

      //migrate to a new s3 location
      for (const itemObject of itemObjects) {
        const versionId = itemObject['Key'].split('/').reverse();
        await Promise.all([
          copyObjects(
            owner.S as string,
            itemObject['Key'],
            id.S as string,
            versionId[0],
            clientId.S as string
          ),
          // delete previous objects
          deleteObjects(itemObject['Key']),
        ]).then(() => console.log('Object moved'));
      }
    }
  }
}

export async function performTransfer() {
  const parameters = getParameters();
  const items = await retrieveAllTemplates(parameters);
  await backupData(items, parameters);
  await backupObject(parameters);
  await updateItems(items, parameters);
}
