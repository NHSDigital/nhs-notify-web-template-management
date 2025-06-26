/*
 * Playwright setting up Auth -> https://playwright.dev/docs/auth
 */

import path from 'node:path';
import { test as setup } from '@playwright/test';
import { BackendConfigHelper } from 'nhs-notify-web-template-management-util-backend-config';
import { TemplateMgmtSignInPage } from '../../pages/templates-mgmt-login-page';
import {
  createAuthHelper,
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';
import {
  GetMalwareProtectionPlanCommand,
  GuardDutyClient,
  ListDetectorsCommand,
  ListMalwareProtectionPlansCommand,
} from '@aws-sdk/client-guardduty';
import {
  EventBridgeClient,
  ListRulesCommand,
} from '@aws-sdk/client-eventbridge';

async function logProtectionPlan() {
  const gd = new GuardDutyClient({ region: 'eu-west-2' });

  const ds = await gd.send(new ListDetectorsCommand({}));

  console.dir(ds, { depth: Infinity });

  const listed = await gd.send(new ListMalwareProtectionPlansCommand({}));

  const plans = await Promise.all(
    (listed.MalwareProtectionPlans ?? []).map(({ MalwareProtectionPlanId }) =>
      gd.send(new GetMalwareProtectionPlanCommand({ MalwareProtectionPlanId }))
    )
  );

  const plan = plans.find((p) => p.Tags?.Environment === '0074flaky');
  const planId = plan?.Arn?.split('/').at(-1);

  console.dir(plan, { depth: Infinity });

  let i = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    console.log('i:', i);

    const updated = await gd.send(
      new GetMalwareProtectionPlanCommand({ MalwareProtectionPlanId: planId })
    );
    console.log(updated);

    if (updated.Status === 'ACTIVE') break;

    await new Promise((r) => setTimeout(r, 500));

    i += 1;
  }
}

async function logEventRules() {
  const eb = new EventBridgeClient({ region: 'eu-west-2' });

  const rules = await eb.send(new ListRulesCommand({}));

  const envRules = rules.Rules?.filter((r) =>
    r.EventPattern?.includes('0074flaky')
  );

  console.dir(envRules, { depth: Infinity });
}

setup('e2e test setup', async ({ page }) => {
  const backendConfig = BackendConfigHelper.fromTerraformOutputsFile(
    path.join(__dirname, '..', '..', '..', '..', 'sandbox_tf_outputs.json')
  );

  BackendConfigHelper.toEnv(backendConfig);

  // await logProtectionPlan();

  // await logEventRules();

  const auth = createAuthHelper();

  await auth.setup();

  const user = await auth.getTestUser(testUsers.User1.userId);

  const loginPage = new TemplateMgmtSignInPage(page);

  await loginPage.loadPage();

  await loginPage.cognitoSignIn(user);

  await page.waitForURL('/templates/create-and-submit-templates');

  await page.context().storageState({
    path: path.resolve(__dirname, '..', '.auth', 'e2e', 'user.json'),
  });
});
