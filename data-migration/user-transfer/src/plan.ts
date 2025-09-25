/* eslint-disable unicorn/no-process-exit */
/* eslint-disable unicorn/prefer-top-level-await */
import { CognitoRepository } from './utils/cognito-repository';
import { retrieveAllTemplatesV2 } from './utils/ddb-utils';
import {
  listItemObjectsWithPaginator,
  writeJsonToFile as writeRemote,
} from './utils/s3-utils';
import { MigrationHandler } from './utils/migration-handler';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getAccountId } from './utils/sts-utils';
import { print } from './utils/log';

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

const cognitoCrawler = new CognitoRepository(
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

  return {
    accountId,
    templateTableName: `nhs-notify-${params.environment}-${params.component}-api-templates`,
    templatesS3InternalBucketName: `nhs-notify-${accountId}-eu-west-2-${params.environment}-${params.component}-internal`,
    templatesS3BackupBucketName: `nhs-notify-${accountId}-eu-west-2-main-acct-migration-backup`,
  };
}

async function plan() {
  const {
    accountId,
    templateTableName,
    templatesS3InternalBucketName,
    templatesS3BackupBucketName,
  } = await getConfig();

  const users = await cognitoCrawler.getAllUsers();

  const templates = await retrieveAllTemplatesV2(templateTableName);

  const files = await listItemObjectsWithPaginator(
    templatesS3InternalBucketName
  );

  const transferPlan = await MigrationHandler.plan(
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

  const fileName = `transfer-plan-${accountId}-${params.environment}-${params.component}-${Date.now()}.json`;

  const data = JSON.stringify(transferPlan);

  const filePath = `ownership-transfer/${params.environment}/${fileName}`;

  await writeRemote(filePath, data, templatesS3BackupBucketName);

  print(`Plan written to s3://${templatesS3InternalBucketName}/${filePath}`);
}

plan().catch((error) => {
  console.error(error);
  process.exit(1);
});
