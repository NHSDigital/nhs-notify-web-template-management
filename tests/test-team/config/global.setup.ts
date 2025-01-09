import { FullConfig } from '@playwright/test';

import { randomUUID as uuidv4 } from 'node:crypto';
import generate from 'generate-password';
import { ConfigHelper } from '../helpers/config-helper';
import { CognitoUserHelper } from '../helpers/cognito-user-helper';

async function globalSetup(config: FullConfig) {
  const configHelper = new ConfigHelper();

  process.env.TEMPLATE_STORAGE_TABLE_NAME =
    configHelper.getTemplateStorageTableName();

  process.env.COGNITO_USER_POOL_ID = configHelper.getCognitoUserPoolId();

  process.env.COGNITO_USER_POOL_CLIENT_ID =
    configHelper.getCognitoUserPoolClientId();

  const cognitoUserHelper = new CognitoUserHelper();

  const [temporary, password] = generate.generateMultiple(2, {
    length: 12,
    numbers: true,
    uppercase: true,
    symbols: true,
    strict: true,
  });

  const user = await cognitoUserHelper.createUser(
    `${uuidv4().slice(0, 5)}-playwright-nhs-notify-web-template-mmgmt@notify.nhs.uk`,
    temporary
  );

  process.env.USER_TEMPORARY_PASSWORD = temporary;
  process.env.USER_PASSWORD = password;
  process.env.USER_EMAIL = user.email;
  process.env.USER_ID = user.userId;

  return config;
}

export default globalSetup;
