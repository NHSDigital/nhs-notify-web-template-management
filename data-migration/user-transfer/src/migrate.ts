import fs from 'node:fs';
import path from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { UserTransferPlan, UserTransferPlanItem } from './utils/types';
import { print } from './utils/log-utils';
import { UserTransfer } from './utils/user-transfer';
import { getTemplates } from './utils/ddb-utils';
import { backupBucketName, backupData, writeLocal } from './utils/backup-utils';
import {
  transferFileToNewBucket,
  writeFile as writeRemote,
} from './utils/s3-utils';
import { AttributeValue } from '@aws-sdk/client-dynamodb';

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
  templates: Record<string, AttributeValue>[],
  sourceBucket: string,
  backupBucket: string,
  migrations: UserTransferPlanItem[]
) {
  const files = migrations.flatMap((r) => r.s3.files.flatMap((a) => a.from));

  const { name } = path.parse(params.file);

  await backupData(
    templates,
    backupBucket,
    `ownership-transfer/${params.environment}/${name}`
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

function assertMatchingTemplates(
  fetchedTemplateIds: string[],
  migrationTemplateIds: string[]
) {
  const left = new Set(fetchedTemplateIds);
  const right = new Set(migrationTemplateIds);

  if (left.size !== right.size) {
    throw new Error(
      `Mismatch in length of fetched templates and templates to migrate`
    );
  }

  for (const value of left) {
    if (!right.has(value)) {
      throw new Error(
        `Value "${value}" found in first array but not in second`
      );
    }
  }
}

async function migrate() {
  const backupBucket = await backupBucketName();

  const input = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFileSync(params.file, 'utf8')
  ) as UserTransferPlan;

  const output: UserTransferPlan = {
    ...input,
  };

  const migrations = input.migrate.plans.filter((r) => r.status === 'migrate');

  print(`Total migrations: ${migrations.length}`);

  const templates = await loadTemplates(input.tableName, migrations);

  assertMatchingTemplates(
    templates.map((r) => r.id.S!),
    migrations.map((r) => r.templateId)
  );

  if (!params.dryRun) {
    await backup(templates, input.bucketName, backupBucket, migrations);
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

    if (idx === -1) {
      print(
        `Skipping: Unable to locate index in output data for ${migration.templateId}`
      );
      continue;
    }

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

  writeLocal(path.join(dir, filename), data);

  await writeRemote(
    `ownership-transfer/${params.environment}/${name}/${filename}`,
    data,
    backupBucket
  );

  print(`Results written to ${filename}`);
}

migrate()
  .then(() => console.log('finished'))
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch((error) => console.error(error));
