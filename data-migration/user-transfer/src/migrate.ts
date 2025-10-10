import { writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { UserTransferPlan, UserTransferPlanItem } from './utils/types';
import { print } from './utils/log-utils';
import { UserTransfer } from './utils/user-transfer';
import { getTemplates } from './utils/ddb-utils';
import { getAccountId } from './utils/sts-utils';
import {
  transferFileToNewBucket,
  writeFile,
  writeFile as writeRemote,
} from './utils/s3-utils';
import { AttributeValue } from '@aws-sdk/client-dynamodb';

type MigrateParameters = {
  file: string;
  environment: string;
  dryRun: boolean;
};

async function loadTemplates(
  tableName: string,
  migrations: UserTransferPlanItem[]
) {
  const keys = migrations.map((r) => ({
    id: r.templateId,
    owner: r.ddb.owner.from,
  }));

  return await getTemplates(tableName, keys);
}

async function backup(
  params: MigrateParameters,
  templates: Record<string, AttributeValue>[],
  sourceBucket: string,
  backupBucket: string,
  migrations: UserTransferPlanItem[]
) {
  const timestamp = new Date().toISOString().replaceAll(/[.:T-]/g, '_');

  const files = migrations.flatMap((r) => r.s3.files.flatMap((a) => a.from));

  const { name } = path.parse(params.file);

  await writeFile(
    `ownership-transfer/${params.environment}/${name}/${timestamp}.json`,
    JSON.stringify(templates),
    backupBucket
  );

  await Promise.all(
    files.map((file) =>
      transferFileToNewBucket(
        sourceBucket,
        backupBucket,
        file,
        `ownership-transfer/${params.environment}/${name}/${file}`
      )
    )
  );
}

export async function migrate(params: MigrateParameters) {
  const accountId = await getAccountId();
  const backupBucket = `nhs-notify-${accountId}-eu-west-2-main-acct-migration-backup`;

  const input = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    readFileSync(params.file, 'utf8')
  ) as UserTransferPlan;

  const output: UserTransferPlan = {
    ...input,
  };

  const migrations = input.migrate.plans.filter((r) => r.status === 'migrate');

  print(`Total migrations: ${migrations.length}`);

  const templates = await loadTemplates(input.tableName, migrations);

  if (!params.dryRun) {
    await backup(params, templates, input.bucketName, backupBucket, migrations);
    print('Data backed up');
  }

  let count = 0;

  for (const migration of migrations) {
    count += 1;

    print(`Progress: ${count}/${migrations.length}`);
    print(`Processing: ${migration.templateId}`);

    const template = templates.find((r) => r.id.S === migration.templateId);

    if (!template) {
      print(
        `Skipping: Unable to find template ${migration.templateId} in backup data`
      );
      continue;
    }

    const idx = output.migrate.plans.findIndex(
      (r) => r.templateId === migration.templateId
    );

    const result = await UserTransfer.apply(migration, template, {
      bucketName: input.bucketName,
      tableName: input.tableName,
      dryRun: params.dryRun,
    });

    output.migrate.plans[idx] = {
      ...output.migrate.plans[idx],
      stage: result.stage,
      status: result.success ? 'success' : 'failed',
      reason: JSON.stringify(result.reasons),
    };

    print(`Result: success - [${result.success}]`);
  }

  const { dir, name, ext } = path.parse(params.file);
  const filename = `${name}-${params.dryRun ? 'dryrun' : 'run'}${ext}`;
  const data = JSON.stringify(output);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  writeFileSync(path.join(dir, filename), data);

  await writeRemote(
    `ownership-transfer/${params.environment}/${name}/${filename}`,
    data,
    backupBucket
  );

  print(`Results written to ${filename}`);
}
