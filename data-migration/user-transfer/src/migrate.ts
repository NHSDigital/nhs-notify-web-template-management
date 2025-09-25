/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable unicorn/prefer-top-level-await */
import fs from 'node:fs';
import path from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { UserTransferPlan, UserTransferPlanItem } from './utils/types';
import { print } from './utils/log-utils';
import { UserTransfer } from './utils/user-transfer';
import { getTemplates } from './utils/ddb-utils';
import { backupBucketName, backupData } from './utils/backup-utils';
import { transferFileToNewBucket, writeFile } from './utils/s3-utils';

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

function writeLocal(filename: string, data: string) {
  fs.writeFile(filename, data, (err) => {
    if (err) {
      console.log(`Error writing file: ${filename}`, err);
    } else {
      console.log(`Successfully wrote ${filename}`);
    }
  });
}

async function backup(
  tableName: string,
  sourceBucket: string,
  backupBucket: string,
  migrations: UserTransferPlanItem[]
) {
  const keys = migrations.map((r) => ({
    id: r.templateId,
    owner: r.ddb.owner.from,
  }));

  const files = migrations.flatMap((r) => r.s3.files.flatMap((a) => a.from));

  const data = await getTemplates(tableName, keys);

  if (data.length !== migrations.length) {
    throw new Error(
      `Only retrieved ${data.length}/${migrations.length} migrations`
    );
  }

  const { name } = path.parse(params.file);

  await backupData(
    data,
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

async function migrate() {
  const backupBucket = await backupBucketName();

  const input = JSON.parse(
    fs.readFileSync(params.file, 'utf8')
  ) as UserTransferPlan;

  const output: UserTransferPlan = {
    ...input,
  };

  const migrations = input.migrate.plans.filter((r) => r.status === 'migrate');

  print(`Total migrations: ${migrations.length}`);

  if (!params.dryRun) {
    await backup(input.tableName, input.bucketName, backupBucket, migrations);
  }

  for (let i = 0; i < migrations.length; i++) {
    const migration = migrations[i];

    const idx = output.migrate.plans.findIndex(
      (r) => r.templateId === migration.templateId
    );

    if (idx === -1) {
      print(`Skipping: Unable to locate index for ${migration.templateId}`);
      continue;
    }

    print(`Progress: ${i + 1}/${migrations.length}`);
    print(`Processing: ${migration.templateId}`);

    const result = await UserTransfer.apply(migration, {
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

  const fileName = `${name}-${params.dryRun ? 'dryrun' : ''}${ext}`;

  const data = JSON.stringify(output);

  const filePath = `ownership-transfer/${params.environment}/${name}/${fileName}`;

  writeLocal(path.join(dir, fileName), data);

  await writeFile(filePath, data, backupBucket);

  print(`Plan written to s3://${backupBucket}/${filePath}`);
}

migrate()
  .then(() => console.log('finished'))
  .catch((error) => console.error(error));
