import {
  createAuthHelper,
  TestUser,
  testUsers,
} from 'helpers/auth/cognito-auth-helper';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import { test } from 'fixtures/accessibility-analyze';
import {
  RoutingChooseMessageOrderPage,
  RoutingCreateMessagePlanPage,
  RoutingChooseTemplatesPage,
  RoutingInvalidMessagePlanPage,
  RoutingMessagePlanCampaignIdRequiredPage,
  RoutingMessagePlansPage,
} from 'pages/routing';
import { loginAsUser } from 'helpers/auth/login-as-user';
import { randomUUID } from 'node:crypto';
import { TemplateFactory } from 'helpers/factories/template-factory';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';

let userWithMultipleCampaigns: TestUser;
const routingStorageHelper = new RoutingConfigStorageHelper();
const templateStorageHelper = new TemplateStorageHelper();
const validRoutingConfigId = randomUUID();
const messageOrder = 'NHSAPP,EMAIL,SMS,LETTER';

test.describe('Routing - Accessibility', () => {
  test.beforeAll(async () => {
    const authHelper = createAuthHelper();

    const user = await authHelper.getTestUser(testUsers.User1.userId);

    userWithMultipleCampaigns = await authHelper.getTestUser(
      testUsers.UserWithMultipleCampaigns.userId
    );

    const templateIds = {
      NHSAPP: randomUUID(),
      SMS: randomUUID(),
      LETTER: randomUUID(),
    };

    const routingConfig = RoutingConfigFactory.createForMessageOrder(
      user,
      messageOrder,
      {
        id: validRoutingConfigId,
        name: 'Test plan with some templates',
      }
    )
      .addTemplate('NHSAPP', templateIds.NHSAPP)
      .addTemplate('SMS', templateIds.SMS)
      .addTemplate('LETTER', templateIds.LETTER).dbEntry;

    const templates = [
      TemplateFactory.createNhsAppTemplate(
        templateIds.NHSAPP,
        user,
        'Test NHS App template'
      ),
      TemplateFactory.createSmsTemplate(
        templateIds.SMS,
        user,
        'Test SMS template'
      ),
      TemplateFactory.uploadLetterTemplate(
        templateIds.LETTER,
        user,
        'Test Letter template'
      ),
    ];

    await routingStorageHelper.seed([routingConfig]);
    await templateStorageHelper.seedTemplateData(templates);
  });

  test.afterAll(async () => {
    await routingStorageHelper.deleteSeeded();
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('Message plans', async ({ page, analyze }) =>
    analyze(new RoutingMessagePlansPage(page)));

  test('Campaign required', async ({ page, analyze }) =>
    analyze(new RoutingMessagePlanCampaignIdRequiredPage(page)));

  test('Invalid message plans', async ({ page, analyze }) =>
    analyze(new RoutingInvalidMessagePlanPage(page)));

  test('Choose message order', async ({ page, analyze }) =>
    analyze(new RoutingChooseMessageOrderPage(page)));

  test('Choose template', async ({ page, analyze }) =>
    analyze(
      new RoutingChooseTemplatesPage(page).setPathParam(
        'messagePlanId',
        validRoutingConfigId
      )
    ));

  test('Choose message order - error', async ({ page, analyze }) =>
    analyze(new RoutingChooseMessageOrderPage(page), {
      beforeAnalyze: (p) => p.clickContinueButton(),
    }));

  test.describe('client has multiple campaigns', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      await loginAsUser(userWithMultipleCampaigns, page);
    });

    test('Create message plan', async ({ page, analyze }) =>
      analyze(
        new RoutingCreateMessagePlanPage(page).setSearchParam(
          'messageOrder',
          messageOrder
        )
      ));

    test('Create message plan - error', async ({ page, analyze }) =>
      analyze(
        new RoutingCreateMessagePlanPage(page).setSearchParam(
          'messageOrder',
          messageOrder
        ),
        {
          beforeAnalyze: (p) => p.clickSubmit(),
        }
      ));
  });
});
