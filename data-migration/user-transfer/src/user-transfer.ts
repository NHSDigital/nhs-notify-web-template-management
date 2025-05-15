/* eslint-disable unicorn/no-zero-fractions */
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { retrieveTemplates, updateItem } from '@/src/utils/ddb-utils';
import { backupData } from '@/src/utils/backup-utils';
import { Parameters } from '@/src/utils/constants';

function getParameters(): Parameters {
  return yargs(hideBin(process.argv))
    .options({
      sourceOwner: {
        type: 'string',
        demandOption: true,
      },
      destinationOwner: {
        type: 'string',
        demandOption: true,
      },
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
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    await updateItem(item, parameters);
    console.log(
      `Updated ${item.id.S}: ${i + 1}/${items.length} (${(100.0 * (i + 1)) / items.length}%)`
    );
  }
}

export async function performTransfer() {
  const parameters = getParameters();
  const items = await retrieveTemplates(parameters);
  await backupData(items, parameters);
  await updateItems(items, parameters);
}
