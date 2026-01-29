/* eslint-disable unicorn/no-negated-condition */
/* eslint-disable unicorn/no-array-reduce */
/* eslint-disable security/detect-non-literal-fs-filename */
import { logger } from '@/src/utils/logger';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {
  INTERNAL_ID_ATTRIBUTE,
  discoverUserPoolId,
  retrieveUsers,
} from '@/src/utils/aws/cognito-util';
import { readFileSync, writeFileSync } from 'node:fs';
import {
  retrieveAllRoutingConfigurations,
  retrieveAllTemplates,
  updateRoutingConfigurationRecord,
  updateTemplateRecord,
} from '@/src/utils/template-management-repository';
import { backupDataToS3, getTimestamp } from '@/src/utils/backup-util';
import { NativeAttributeValue } from '@aws-sdk/lib-dynamodb';

function readParams(): {
  env: string;
  dryRun: boolean;
  userDetailsFile?: string;
} {
  return yargs(hideBin(process.argv))
    .options({
      env: {
        type: 'string',
        demandOption: true,
      },
      dryRun: {
        type: 'boolean',
        default: true,
      },
      userDetailsFile: {
        type: 'string',
        default: undefined,
      },
    })
    .parseSync();
}

function migrateField(
  userDetails: Record<string, string>,
  fieldValue?: string
): {
  outcome:
    | 'blank-cannot-migrate'
    | 'already-migrated'
    | 'missing-mapping'
    | 'mapping-found';
  newValue?: string;
} {
  if (!fieldValue || fieldValue.trim() === '') {
    return { outcome: 'blank-cannot-migrate' };
  }

  if (fieldValue.startsWith('INTERNAL_USER#')) {
    return { outcome: 'already-migrated' };
  }

  const mappedValue = userDetails[fieldValue];
  if (!mappedValue) {
    return { outcome: 'missing-mapping' };
  }

  return { outcome: 'mapping-found', newValue: `INTERNAL_USER#${mappedValue}` };
}

async function migrateTemplate(
  template: Record<string, NativeAttributeValue>,
  userDetails: Record<string, string>,
  env: string,
  dryRun: boolean
): Promise<boolean> {
  return migrateRecord(template, 'template', userDetails, env, dryRun);
}

async function migrateRoutingConfiguration(
  routingConfiguration: Record<string, NativeAttributeValue>,
  userDetails: Record<string, string>,
  env: string,
  dryRun: boolean
): Promise<boolean> {
  return migrateRecord(
    routingConfiguration,
    'routing-configuration',
    userDetails,
    env,
    dryRun
  );
}

async function migrateRecord(
  record: Record<string, NativeAttributeValue>,
  entity: 'template' | 'routing-configuration',
  userDetails: Record<string, string>,
  env: string,
  dryRun: boolean
): Promise<boolean> {
  const createdBy = record['createdBy'] as string | undefined;
  const updatedBy = record['updatedBy'] as string | undefined;
  const id = record['id'] as string;

  const createdByMigration = migrateField(userDetails, createdBy);
  const updatedByMigration = migrateField(userDetails, updatedBy);

  const updateNeeded =
    createdByMigration.outcome === 'mapping-found' ||
    updatedByMigration.outcome === 'mapping-found';

  logger.info(
    `${entity} ID: ${id} UpdateNeeded: ${updateNeeded} - CreatedBy/UpdatedBy: ${createdByMigration.outcome}/${updatedByMigration.outcome}`
  );

  let updated = false;
  if (updateNeeded) {
    if (!dryRun) {
      const updateResult =
        entity === 'template'
          ? await updateTemplateRecord(
              env,
              record,
              createdByMigration.newValue,
              updatedByMigration.newValue
            )
          : await updateRoutingConfigurationRecord(
              env,
              record,
              createdByMigration.newValue,
              updatedByMigration.newValue
            );

      updated = updateResult === 'success';
      logger.info(`${entity} ID: ${id} update result: ${updateResult}`);
    } else {
      updated = true;
      logger.info(`${entity} ID: ${id} dry run - no update performed`);
    }
  }
  return updated;
}

async function exportUserDetailsToDisk(
  dryRun: boolean,
  env: string
): Promise<string> {
  // Discover user pool ID
  const userPoolId = await discoverUserPoolId(env);

  // Extract user from Cognito
  const users = await retrieveUsers(userPoolId);

  // Convert into an ID mapping
  const userIdMapping = users
    .map((user) => {
      const sub = user.Attributes?.find((attr) => attr.Name === 'sub')?.Value;
      const internalId = user.Attributes?.find(
        (attr) => attr.Name === INTERNAL_ID_ATTRIBUTE
      )?.Value;
      return [sub, internalId];
    })
    .filter(([sub, internalId]) => sub && internalId)
    .reduce(
      (acc, [sub, internalId]) => {
        acc[sub!] = internalId!;
        return acc;
      },
      {} as Record<string, string>
    );

  const filePath = `user-migration-export-${env}-${getTimestamp()}.json`;
  if (!dryRun) {
    writeFileSync(filePath, JSON.stringify(userIdMapping, null, 2));
  }
  return filePath;
}

export async function runMigration() {
  // Read parameters
  const { dryRun, env, userDetailsFile } = readParams();

  if (!userDetailsFile) {
    const exportedFilePath = await exportUserDetailsToDisk(dryRun, env);
    logger.info(`User details exported to file: ${exportedFilePath}`);
    return;
  }

  // Read in user data
  const userDetails = JSON.parse(readFileSync(userDetailsFile, 'utf8'));

  // Retrieve data from DynamoDB
  const templates = await retrieveAllTemplates(env);
  const routingConfigs = await retrieveAllRoutingConfigurations(env);

  // Backup existing data
  await backupDataToS3({ templates, routingConfigs, userDetails }, env);

  // Update templates with new user identifiers
  let countTemplatesUpdated = 0;
  for (const template of templates) {
    const updated = await migrateTemplate(template, userDetails, env, dryRun);
    if (updated) {
      countTemplatesUpdated++;
    }
  }

  // Update routing configs with new user identifiers
  let countRoutingConfigsUpdated = 0;
  for (const routingConfig of routingConfigs) {
    const updated = await migrateRoutingConfiguration(
      routingConfig,
      userDetails,
      env,
      dryRun
    );
    if (updated) {
      countRoutingConfigsUpdated++;
    }
  }

  logger.info(
    `Templates updated: ${countTemplatesUpdated}/${templates.length}`
  );
  logger.info(
    `Routing configurations updated: ${countRoutingConfigsUpdated}/${routingConfigs.length}`
  );
  logger.info('Data migration of user identifiers completed successfully');
}
