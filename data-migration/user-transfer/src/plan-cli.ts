import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { plan } from './plan';

const params = yargs(hideBin(process.argv))
  .options({
    environment: {
      type: 'string',
      demandOption: true,
    },
    userPoolId: {
      type: 'string',
      demandOption: true,
    },
    iamAccessKeyId: {
      type: 'string',
      demandOption: true,
    },
    iamSecretAccessKey: {
      type: 'string',
      demandOption: true,
    },
    iamSessionToken: {
      type: 'string',
      demandOption: true,
    },
  })
  .parseSync();

// eslint-disable-next-line unicorn/prefer-top-level-await
plan(params).catch((error) => {
  console.error(error);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
});
