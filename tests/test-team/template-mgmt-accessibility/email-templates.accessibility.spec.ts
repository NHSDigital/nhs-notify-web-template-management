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
  TemplateMgmtCreateEmailPage,
  TemplateMgmtEditEmailPage,
  TemplateMgmtPreviewEmailPage,
  TemplateMgmtPreviewSubmittedEmailPage,
  TemplateMgmtSubmitEmailPage,
  TemplateMgmtTemplateSubmittedEmailPage,
} from '../pages/email';
import { loginAsUser } from 'helpers/auth/login-as-user';

const templateIds = {
  DRAFT: randomUUID(),
  SUBMITTED: randomUUID(),
  DRAFT_ROUTING_DISABLED: randomUUID(),
};
const templateStorageHelper = new TemplateStorageHelper();
let userWithTemplateData: TestUser;
let userWithRoutingDisabled: TestUser;

test.beforeAll(async () => {
  const authHelper = createAuthHelper();
  userWithTemplateData = await authHelper.getTestUser(testUsers.User1.userId);
  userWithRoutingDisabled = await authHelper.getTestUser(
    testUsers.User2.userId
  );

  const draft = TemplateFactory.createEmailTemplate(
    templateIds.DRAFT,
    userWithTemplateData,
    `Draft email template - ${templateIds.DRAFT}`
  );

  const submitted = TemplateFactory.createEmailTemplate(
    templateIds.SUBMITTED,
    userWithTemplateData,
    `Submitted email template - ${templateIds.SUBMITTED}`,
    'SUBMITTED'
  );

  const draftRoutingDisabled = TemplateFactory.createEmailTemplate(
    templateIds.DRAFT_ROUTING_DISABLED,
    userWithRoutingDisabled,
    `Draft email template with routing disabled - ${templateIds.DRAFT_ROUTING_DISABLED}`
  );

  await templateStorageHelper.seedTemplateData([
    draft,
    submitted,
    draftRoutingDisabled,
  ]);
});

test.afterAll(async () => {
  await templateStorageHelper.deleteSeededTemplates();
});

test.describe('Email templates', () => {
  test('Create email template', async ({ page, analyze }) =>
    analyze(new TemplateMgmtCreateEmailPage(page)));

  test('Create email template error', async ({ page, analyze }) =>
    analyze(new TemplateMgmtCreateEmailPage(page), {
      beforeAnalyze: async (p) => {
        p.clickSaveAndPreviewButton();
        await p.errorSummary.isVisible();
      },
    }));

  test('Edit email template', async ({ page, analyze }) =>
    analyze(
      new TemplateMgmtEditEmailPage(page).setPathParam(
        'templateId',
        templateIds.DRAFT
      )
    ));

  test('Edit email template error', async ({ page, analyze }) =>
    analyze(
      new TemplateMgmtEditEmailPage(page).setPathParam(
        'templateId',
        templateIds.DRAFT
      ),
      {
        beforeAnalyze: async (p) => {
          await p.nameInput.clear();
          await p.subjectLineInput.clear();
          await p.messageTextArea.clear();
          await p.clickSaveAndPreviewButton();
          await p.errorSummary.isVisible();
        },
      }
    ));

  test('Preview email template', async ({ page, analyze }) =>
    analyze(
      new TemplateMgmtPreviewEmailPage(page).setPathParam(
        'templateId',
        templateIds.DRAFT
      )
    ));

  test('Preview submitted email template', async ({ page, analyze }) =>
    analyze(
      new TemplateMgmtPreviewSubmittedEmailPage(page).setPathParam(
        'templateId',
        templateIds.SUBMITTED
      )
    ));

  test('Email template submitted', async ({ page, analyze }) =>
    analyze(
      new TemplateMgmtTemplateSubmittedEmailPage(page).setPathParam(
        'templateId',
        templateIds.SUBMITTED
      )
    ));

  test.describe('With routing disabled', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      await loginAsUser(userWithRoutingDisabled, page);
    });

    test('Submit Email template', async ({ page, analyze }) => {
      await analyze(
        new TemplateMgmtSubmitEmailPage(page)
          .setPathParam('templateId', templateIds.DRAFT_ROUTING_DISABLED)
          .setSearchParam('lockNumber', '0')
      );
    });
  });
});
