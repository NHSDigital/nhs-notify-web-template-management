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
  TemplateMgmtCreateNhsAppPage,
  TemplateMgmtEditNhsAppPage,
  TemplateMgmtPreviewNhsAppPage,
  TemplateMgmtPreviewSubmittedNhsAppPage,
  TemplateMgmtSubmitNhsAppPage,
  TemplateMgmtTemplateSubmittedNhsAppPage,
} from '../pages/nhs-app';

const templateIds = {
  DRAFT: randomUUID(),
  SUBMITTED: randomUUID(),
};
const templateStorageHelper = new TemplateStorageHelper();
let userWithTemplateData: TestUser;

test.beforeAll(async () => {
  const authHelper = createAuthHelper();
  userWithTemplateData = await authHelper.getTestUser(testUsers.User1.userId);

  const draft = TemplateFactory.createNhsAppTemplate(
    templateIds.DRAFT,
    userWithTemplateData,
    `Draft NHS App template - ${templateIds.DRAFT}`
  );

  const submitted = TemplateFactory.createNhsAppTemplate(
    templateIds.SUBMITTED,
    userWithTemplateData,
    `Submitted NHS App template - ${templateIds.SUBMITTED}`
  );

  await templateStorageHelper.seedTemplateData([draft, submitted]);
});

test('Create NHS App template', async ({ page, analyze }) =>
  analyze(new TemplateMgmtCreateNhsAppPage(page)));

test('Create NHS App template error', async ({ page, analyze }) =>
  analyze(new TemplateMgmtCreateNhsAppPage(page), {
    beforeAnalyze: (p) => p.clickSaveAndPreviewButton(),
  }));

test('Edit NHS App template', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtEditNhsAppPage(page).setPathParam(
      'templateId',
      templateIds.DRAFT
    )
  ));

test('Edit NHS App template error', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtEditNhsAppPage(page).setPathParam(
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

test('Preview NHS App template', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtPreviewNhsAppPage(page).setPathParam(
      'templateId',
      templateIds.DRAFT
    )
  ));

test('Preview submitted NHS App template', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtPreviewSubmittedNhsAppPage(page).setPathParam(
      'templateId',
      templateIds.SUBMITTED
    )
  ));

test('Submit NHS App template', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtSubmitNhsAppPage(page).setPathParam(
      'templateId',
      templateIds.DRAFT
    )
  ));

test('NHS App template submitted', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtTemplateSubmittedNhsAppPage(page).setPathParam(
      'templateId',
      templateIds.SUBMITTED
    )
  ));
