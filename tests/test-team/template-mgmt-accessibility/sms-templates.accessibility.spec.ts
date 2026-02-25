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

  const draft = TemplateFactory.createSmsTemplate(
    templateIds.DRAFT,
    userWithTemplateData,
    `Draft SMS template - ${templateIds.DRAFT}`
  );

  const submitted = TemplateFactory.createSmsTemplate(
    templateIds.SUBMITTED,
    userWithTemplateData,
    `Submitted SMS template - ${templateIds.SUBMITTED}`,
    'SUBMITTED'
  );

  const draftRoutingDisabled = TemplateFactory.createSmsTemplate(
    templateIds.DRAFT_ROUTING_DISABLED,
    userWithRoutingDisabled,
    `Draft NHS App template with routing disabled - ${templateIds.DRAFT_ROUTING_DISABLED}`
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

test.describe('SMS templates', () => {
  test('Create a SMS template', async ({ page, analyze }) =>
    analyze(new TemplateMgmtCreateSmsPage(page)));

  test('Create a SMS template error', async ({ page, analyze }) =>
    analyze(new TemplateMgmtCreateSmsPage(page), {
      beforeAnalyze: async (p) => {
        p.clickSaveAndPreviewButton();
        await p.errorSummary.isVisible();
      },
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

  test('SMS template submitted', async ({ page, analyze }) =>
    analyze(
      new TemplateMgmtTemplateSubmittedSmsPage(page).setPathParam(
        'templateId',
        templateIds.SUBMITTED
      )
    ));

  test.describe('With routing disabled', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      await loginAsUser(userWithRoutingDisabled, page);
    });

    test('Submit SMS template', async ({ page, analyze }) => {
      await analyze(
        new TemplateMgmtSubmitSmsPage(page)
          .setPathParam('templateId', templateIds.DRAFT_ROUTING_DISABLED)
          .setSearchParam('lockNumber', '0')
      );
    });
  });
});
