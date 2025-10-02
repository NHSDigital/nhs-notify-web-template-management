import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { migrate } from './migrate';

const params = yargs(hideBin(process.argv))
  .options({
    file: {
      type: 'string',
      demandOption: true,
    },
    environment: {
      type: 'string',
      demandOption: true,
    },
    dryRun: {
      type: 'boolean',
      default: true,
    },
  })
  .parseSync();

migrate(params)
  .then(() => console.log('finished'))
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch((error) => console.error(error));
