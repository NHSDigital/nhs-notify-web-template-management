import { CognitoRepository } from './utils/cognito-repository';
import { listAllTemplates } from './utils/ddb-utils';
import { listAllFiles, writeFile as writeRemote } from './utils/s3-utils';
import { UserTransfer } from './utils/user-transfer';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getAccountId } from './utils/sts-utils';
import { print } from './utils/log-utils';
import { backupBucketName, writeLocal } from './utils/backup-utils';

const params = yargs(hideBin(process.argv))
  .options({
    environment: {
      type: 'string',
      demandOption: true,
    },
    component: {
      type: 'string',
      default: 'app',
      options: ['sbx', 'app'],
    },
    userPoolId: {
      type: 'string',
      demandOption: true,
    },
    iamAccessKeyId: {
      type: 'string',
    },
    iamSecretAccessKey: {
      type: 'string',
    },
    iamSessionToken: {
      type: 'string',
    },
  })
  .check((argv) => {
    const iamSet =
      !!argv.iamAccessKeyId &&
      !!argv.iamSecretAccessKey &&
      !!argv.iamSessionToken;

    if (argv.component === 'app' && !iamSet) {
      throw new Error(
        'iamAccessKeyId, iamSecretAccessKey, iamSessionToken - must be set when using component: app'
      );
    }
    return true;
  })
  .parseSync();

const cognitoRepository = new CognitoRepository(
  params.userPoolId,
  params.component === 'app'
    ? {
        accessKeyId: params.iamAccessKeyId!,
        secretAccessKey: params.iamSecretAccessKey!,
        sessionToken: params.iamSessionToken!,
      }
    : undefined
);

async function getConfig() {
  const accountId = await getAccountId();
  const backupBucket = await backupBucketName();

  return {
    accountId,
    templateTableName: `nhs-notify-${params.environment}-${params.component}-api-templates`,
    templatesS3InternalBucketName: `nhs-notify-${accountId}-eu-west-2-${params.environment}-${params.component}-internal`,
    templatesS3BackupBucketName: backupBucket,
  };
}

async function plan() {
  const {
    accountId,
    templateTableName,
    templatesS3InternalBucketName,
    templatesS3BackupBucketName,
  } = await getConfig();

  const users = await cognitoRepository.getAllUsers();

  const templates = await listAllTemplates(templateTableName);

  const files = await listAllFiles(templatesS3InternalBucketName);

  const transferPlan = await UserTransfer.plan(
    users,
    {
      tableName: templateTableName,
      templates,
    },
    {
      bucketName: templatesS3InternalBucketName,
      files,
    }
  );

  const filename = `transfer-plan-${accountId}-${params.environment}-${params.component}-${Date.now()}`;
  const data = JSON.stringify(transferPlan);
  const path = `ownership-transfer/${params.environment}/${filename}/${filename}.json`;

  await writeRemote(path, data, templatesS3BackupBucketName);

  writeLocal(`./migrations/${filename}.json`, data);

  print(`Results written to ${filename}.json`);
}

// eslint-disable-next-line unicorn/prefer-top-level-await
plan().catch((error) => {
  console.error(error);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
});
