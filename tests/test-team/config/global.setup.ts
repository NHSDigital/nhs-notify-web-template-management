import { FullConfig } from '@playwright/test';
import { DatabaseTableNameHelper } from '../helpers/database-tablename-helper';

async function globalSetup(config: FullConfig) {
  const tableNameHelper = new DatabaseTableNameHelper();

  process.env.TEMPLATE_STORAGE_TABLE_NAME =
    await tableNameHelper.getTemplateStorageTableName();

  return config;
}

export default globalSetup;
