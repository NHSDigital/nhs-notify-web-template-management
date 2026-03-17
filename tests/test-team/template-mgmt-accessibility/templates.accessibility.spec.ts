import { randomUUID } from 'node:crypto';
import { test } from 'fixtures/accessibility-analyze';
import { TemplateMgmtMessageTemplatesPage } from 'pages/template-mgmt-message-templates-page';
import { TemplateMgmtChoosePage } from 'pages/template-mgmt-choose-page';
import { TemplateMgmtStartPage } from 'pages/template-mgmt-start-page';
import { TemplateMgmtCopyPage } from 'pages/template-mgmt-copy-page';
import { TemplateMgmtDeletePage } from 'pages/template-mgmt-delete-page';
import { TemplateMgmtDeleteErrorPage } from 'pages/template-mgmt-delete-error-page';
import { TemplateMgmtInvalidTemplatePage } from 'pages/template-mgmt-invalid-tempate-page';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from 'helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';
import { TemplateFactory } from 'helpers/factories/template-factory';
import { loginAsUser } from 'helpers/auth/login-as-user';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';

const templateIds = {
  TEMPLATE: randomUUID(),
  TEMPLATE_ATTACHED_TO_MESSAGE_PLAN: randomUUID(),
};
const templateStorageHelper = new TemplateStorageHelper();
const routingConfigStorageHelper = new RoutingConfigStorageHelper();
let userWithNoTemplateData: TestUser;
let userWithTemplateData: TestUser;
let userWithLetterAuthoringEnabledData: TestUser;

test.beforeAll(async () => {
  const authHelper = createAuthHelper();
  userWithNoTemplateData = await authHelper.getTestUser(testUsers.User2.userId);
  userWithTemplateData = await authHelper.getTestUser(testUsers.User1.userId);
  userWithLetterAuthoringEnabledData = await authHelper.getTestUser(
    testUsers.UserLetterAuthoringEnabled.userId
  );

  const template = TemplateFactory.createSmsTemplate(
    templateIds.TEMPLATE,
    userWithTemplateData,
    `Test SMS template - ${templateIds.TEMPLATE}`
  );

  const templateForRoutingPlan = TemplateFactory.createNhsAppTemplate(
    templateIds.TEMPLATE_ATTACHED_TO_MESSAGE_PLAN,
    userWithTemplateData,
    `Test NHS App template - ${templateIds.TEMPLATE_ATTACHED_TO_MESSAGE_PLAN}`
  );

  const templateForLetterAuthoring = TemplateFactory.createNhsAppTemplate(
    templateIds.TEMPLATE,
    userWithLetterAuthoringEnabledData,
    `Test Letter template - ${templateIds.TEMPLATE}`
  );

  const routingPlan = RoutingConfigFactory.createForMessageOrder(
    userWithTemplateData,
    'NHSAPP',
    {
      id: randomUUID(),
      name: 'Message plan 1',
    }
  ).addTemplate('NHSAPP', templateIds.TEMPLATE_ATTACHED_TO_MESSAGE_PLAN);

  await templateStorageHelper.seedTemplateData([
    template,
    templateForRoutingPlan,
    templateForLetterAuthoring,
  ]);

  await routingConfigStorageHelper.seed([routingPlan.dbEntry]);
});

test.afterAll(async () => {
  await templateStorageHelper.deleteSeededTemplates();
  await routingConfigStorageHelper.deleteSeeded();
});

test('Create and submit templates', async ({ page, analyze }) =>
  analyze(new TemplateMgmtStartPage(page)));

test('Message templates (with templates)', async ({ page, analyze }) =>
  analyze(new TemplateMgmtMessageTemplatesPage(page)));

test.describe('Message templates', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('with no templates', async ({ page, analyze }) => {
    await loginAsUser(userWithNoTemplateData, page);

    await analyze(new TemplateMgmtMessageTemplatesPage(page));
  });
});

test('Choose a template type', async ({ page, analyze }) =>
  analyze(new TemplateMgmtChoosePage(page)));

test('Choose a template type error', async ({ page, analyze }) =>
  analyze(new TemplateMgmtChoosePage(page), {
    beforeAnalyze: (p) => p.clickContinueButton(),
  }));

test.describe('Template type page with authoring enabled', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Choose a template type error (no accessibility type)', async ({
    page,
    analyze,
  }) => {
    await loginAsUser(userWithLetterAuthoringEnabledData, page);

    await analyze(new TemplateMgmtChoosePage(page), {
      beforeAnalyze: async (p) => {
        await p.getTemplateTypeRadio('letter').check();
        await p.clickContinueButton();
        await p.letterTypeFormError.isVisible();
      },
    });
  });
});

test('Copy template', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtCopyPage(page).setPathParam(
      'templateId',
      templateIds.TEMPLATE
    )
  ));

test('Copy template error', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtCopyPage(page).setPathParam(
      'templateId',
      templateIds.TEMPLATE
    ),
    {
      beforeAnalyze: (p) => p.clickContinueButton(),
    }
  ));

test('Delete template', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtDeletePage(page).setPathParam(
      'templateId',
      templateIds.TEMPLATE
    )
  ));

test('Delete template error', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtDeleteErrorPage(page).setPathParam(
      'templateId',
      templateIds.TEMPLATE_ATTACHED_TO_MESSAGE_PLAN
    )
  ));

test('Invalid template', async ({ page, analyze }) =>
  analyze(new TemplateMgmtInvalidTemplatePage(page)));
