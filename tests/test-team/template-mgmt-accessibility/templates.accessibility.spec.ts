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

const templateId = randomUUID();
const templateStorageHelper = new TemplateStorageHelper();
let userWithNoTemplateData: TestUser;
let userWithTemplateData: TestUser;

test.beforeAll(async () => {
  const authHelper = createAuthHelper();
  userWithNoTemplateData = await authHelper.getTestUser(testUsers.User2.userId);
  userWithTemplateData = await authHelper.getTestUser(testUsers.User1.userId);

  const template = TemplateFactory.createSmsTemplate(
    templateId,
    userWithTemplateData,
    `Test SMS template - ${templateId}`
  );

  await templateStorageHelper.seedTemplateData([template]);
});

test('Create and submit templates', async ({ page, analyze }) =>
  analyze(new TemplateMgmtStartPage(page)));

test.describe('Message templates (list)', () => {
  test('With templates', async ({ page, analyze }) =>
    analyze(new TemplateMgmtMessageTemplatesPage(page)));

  test('With no templates', async ({ page, analyze }) => {
    test.use({ storageState: { cookies: [], origins: [] } });

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

test('Choose a template type error (no letter variant)', async ({
  page,
  analyze,
}) =>
  analyze(new TemplateMgmtChoosePage(page), {
    beforeAnalyze: async (p) => {
      await p.getTemplateTypeRadio('letter').check();
      await p.clickContinueButton();
      await p.letterTypeFormError.isVisible();
    },
  }));

test('Copy template', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtCopyPage(page).setPathParam('templateId', templateId)
  ));

test('Copy template error', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtCopyPage(page).setPathParam('templateId', templateId),
    {
      beforeAnalyze: (p) => p.clickContinueButton(),
    }
  ));

test('Delete template', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtDeletePage(page).setPathParam('templateId', templateId)
  ));

test('Delete template error', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtDeleteErrorPage(page).setPathParam('templateId', templateId)
  ));

test('Invalid template', async ({ page, analyze }) =>
  analyze(new TemplateMgmtInvalidTemplatePage(page)));
