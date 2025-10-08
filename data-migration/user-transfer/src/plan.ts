import { writeFileSync } from 'node:fs';
import { CognitoRepository } from './utils/cognito-repository';
import { listAllTemplates } from './utils/ddb-utils';
import { listAllFiles, writeFile as writeRemote } from './utils/s3-utils';
import { UserTransfer } from './utils/user-transfer';
import { getAccountId } from './utils/sts-utils';
import { print } from './utils/log-utils';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

type PlanParameters = {
  environment: string;
  userPoolId: string;
  iamAccessKeyId: string;
  iamSecretAccessKey: string;
  iamSessionToken: string;
};

async function setup(params: PlanParameters) {
  const accountId = await getAccountId();

  const cognitoRepository = new CognitoRepository(
    params.userPoolId,
    new CognitoIdentityProviderClient({
      credentials: {
        accessKeyId: params.iamAccessKeyId,
        secretAccessKey: params.iamSecretAccessKey,
        sessionToken: params.iamSessionToken,
      },
    })
  );

  return {
    accountId,
    templateTableName: `nhs-notify-${params.environment}-app-api-templates`,
    templatesS3InternalBucketName: `nhs-notify-${accountId}-eu-west-2-${params.environment}-app-internal`,
    templatesS3BackupBucketName: `nhs-notify-${accountId}-eu-west-2-main-acct-migration-backup`,
    cognitoRepository,
  };
}

export async function plan(params: PlanParameters) {
  const {
    accountId,
    templateTableName,
    templatesS3InternalBucketName,
    templatesS3BackupBucketName,
    cognitoRepository,
  } = await setup(params);

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

  const filename = `transfer-plan-${accountId}-${params.environment}-app-${Date.now()}`;
  const data = JSON.stringify(transferPlan);
  const path = `ownership-transfer/${params.environment}/${filename}/${filename}.json`;

  await writeRemote(path, data, templatesS3BackupBucketName);

  writeFileSync(`./migrations/${filename}.json`, data);

  print(`Results written to ${filename}.json`);
}
