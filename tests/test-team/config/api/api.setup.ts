import { randomUUID } from 'node:crypto';
import { test as setup } from '@playwright/test';
import { createAuthHelper } from '../../helpers/auth/cognito-auth-helper';
import { parseSandboxOutputs } from '../../helpers/setup/parse-sandbox-outputs';

setup('api test setup', async () => {
  process.env.PLAYWRIGHT_RUN_ID = randomUUID();

  parseSandboxOutputs();

  await createAuthHelper().setup();
});
