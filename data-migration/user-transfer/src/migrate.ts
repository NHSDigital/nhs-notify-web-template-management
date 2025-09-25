/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable unicorn/prefer-top-level-await */
import fs from 'node:fs';
import path from 'node:path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { MigrationPlan } from './utils/constants';
import { print } from './utils/log';
import { MigrationHandler } from './utils/migration-handler';

const params = yargs(hideBin(process.argv))
  .options({
    file: {
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

async function migrate() {
  const input = JSON.parse(
    fs.readFileSync(params.file, 'utf8')
  ) as MigrationPlan;

  const output: MigrationPlan = {
    ...input,
    run: input.run + 1,
  };

  const migrations = input.migrate.plans.filter((r) => r.status === 'migrate');

  print(`Total migrations: ${migrations.length}`);

  for (let i = 0; i < migrations.length; i++) {
    const migration = migrations[i];

    const idx = output.migrate.plans.findIndex(
      (r) => r.templateId === migration.templateId
    );

    if (idx === -1) {
      print('Skipping: Unable to locate index for ${templateId}');
      continue;
    }

    print(`Progress: ${i + 1}/${migrations.length}`);
    print(`Processing: ${migration.templateId}`);

    const result = await MigrationHandler.apply(migration, {
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

  const fileName = `${name}-${params.dryRun ? 'dryrun-' : 'run-'}${output.run}${ext}`;

  const data = JSON.stringify(output);

  writeLocal(path.join(dir, fileName), data);
}

migrate()
  .then(() => console.log('finished'))
  .catch((error) => console.error(error));
