import path from 'node:path';
import { test as setup } from '@playwright/test';
import { BackendConfigHelper } from 'nhs-notify-web-template-management-util-backend-config';
import { createAuthHelper } from '../../helpers/auth/cognito-auth-helper';
import { createClientHelper } from '../../helpers/client/client-helper';

setup('api test setup', async () => {
  const backendConfig = BackendConfigHelper.fromTerraformOutputsFile(
    path.join(__dirname, '..', '..', '..', '..', 'sandbox_tf_outputs.json')
  );

  BackendConfigHelper.toEnv(backendConfig);

  await createClientHelper().setup('api');

  await createAuthHelper().setup('api');
});
