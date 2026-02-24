import { randomUUID } from 'node:crypto';
import { test } from 'fixtures/accessibility-analyze';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from 'helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';
import { TemplateFactory } from 'helpers/factories/template-factory';
import {
  TemplateMgmtCreateSmsPage,
  TemplateMgmtEditSmsPage,
  TemplateMgmtPreviewSmsPage,
  TemplateMgmtPreviewSubmittedSmsPage,
  TemplateMgmtSubmitSmsPage,
  TemplateMgmtTemplateSubmittedSmsPage,
} from '../pages/sms';

const templateIds = {
  DRAFT: randomUUID(),
  SUBMITTED: randomUUID(),
};
const templateStorageHelper = new TemplateStorageHelper();
let userWithTemplateData: TestUser;

test.beforeAll(async () => {
  const authHelper = createAuthHelper();
  userWithTemplateData = await authHelper.getTestUser(testUsers.User1.userId);

  const draft = TemplateFactory.createSmsTemplate(
    templateIds.DRAFT,
    userWithTemplateData,
    `Draft SMS template - ${templateIds.DRAFT}`
  );

  const submitted = TemplateFactory.createSmsTemplate(
    templateIds.SUBMITTED,
    userWithTemplateData,
    `Submitted SMS template - ${templateIds.SUBMITTED}`
  );

  await templateStorageHelper.seedTemplateData([draft, submitted]);
});

test('Create a SMS template', async ({ page, analyze }) =>
  analyze(new TemplateMgmtCreateSmsPage(page)));

test('Create a SMS template error', async ({ page, analyze }) =>
  analyze(new TemplateMgmtCreateSmsPage(page), {
    beforeAnalyze: (p) => p.clickSaveAndPreviewButton(),
  }));

test('Edit SMS template', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtEditSmsPage(page).setPathParam(
      'templateId',
      templateIds.DRAFT
    )
  ));

test('Edit SMS template error', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtEditSmsPage(page).setPathParam(
      'templateId',
      templateIds.DRAFT
    ),
    {
      beforeAnalyze: async (p) => {
        await p.nameInput.clear();
        await p.messageTextArea.clear();
        await p.clickSaveAndPreviewButton();
        await p.errorSummary.isVisible();
      },
    }
  ));

test('Preview SMS template', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtPreviewSmsPage(page).setPathParam(
      'templateId',
      templateIds.DRAFT
    )
  ));

test('Preview submitted SMS template', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtPreviewSubmittedSmsPage(page).setPathParam(
      'templateId',
      templateIds.SUBMITTED
    )
  ));

test('Submit SMS template', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtSubmitSmsPage(page).setPathParam(
      'templateId',
      templateIds.DRAFT
    )
  ));

test('SMS template submitted', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtTemplateSubmittedSmsPage(page).setPathParam(
      'templateId',
      templateIds.SUBMITTED
    )
  ));
