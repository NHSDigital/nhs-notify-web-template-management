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

  const draft = TemplateFactory.createNhsAppTemplate(
    templateIds.DRAFT,
    userWithTemplateData,
    `Draft NHS App template - ${templateIds.DRAFT}`
  );

  const submitted = TemplateFactory.createNhsAppTemplate(
    templateIds.SUBMITTED,
    userWithTemplateData,
    `Submitted NHS App template - ${templateIds.SUBMITTED}`,
    'SUBMITTED'
  );

  const draftRoutingDisabled = TemplateFactory.createNhsAppTemplate(
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

test.describe('NHS App templates', () => {
  test('Create NHS App template', async ({ page, analyze }) =>
    analyze(new TemplateMgmtCreateNhsAppPage(page)));

  test('Create NHS App template error', async ({ page, analyze }) =>
    analyze(new TemplateMgmtCreateNhsAppPage(page), {
      beforeAnalyze: async (p) => {
        p.clickSaveAndPreviewButton();
        await p.errorSummary.isVisible();
      },
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

  test('NHS App template submitted', async ({ page, analyze }) =>
    analyze(
      new TemplateMgmtTemplateSubmittedNhsAppPage(page).setPathParam(
        'templateId',
        templateIds.SUBMITTED
      )
    ));

  test.describe('With routing disabled', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      await loginAsUser(userWithRoutingDisabled, page);
    });

    test('Submit NHS App template', async ({ page, analyze }) => {
      await analyze(
        new TemplateMgmtSubmitNhsAppPage(page)
          .setPathParam('templateId', templateIds.DRAFT_ROUTING_DISABLED)
          .setSearchParam('lockNumber', '0')
      );
    });
  });
});
