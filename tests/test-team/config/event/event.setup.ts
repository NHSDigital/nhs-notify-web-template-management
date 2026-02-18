import path from 'node:path';
import { test as setup } from '@playwright/test';
import { BackendConfigHelper } from 'nhs-notify-web-template-management-util-backend-config';
import { createAuthHelper } from '../../helpers/auth/cognito-auth-helper';
import { EventSubscriber } from '../../helpers/events/event-subscriber';

setup('event test setup', async () => {
  const backendConfig = BackendConfigHelper.fromTerraformOutputsFile(
    path.join(__dirname, '..', '..', '..', '..', 'sandbox_tf_outputs.json')
  );

  BackendConfigHelper.toEnv(backendConfig);

  await createAuthHelper().setup();

  await EventSubscriber.cleanup(
    'event',
    backendConfig.environment,
    backendConfig.eventsSnsTopicArn
  );
});
