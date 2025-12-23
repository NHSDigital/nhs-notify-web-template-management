import { test, expect } from '@playwright/test';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertAndClickBackLinkTop,
  assertBackLinkBottom,
} from '../../helpers/template-mgmt-common.steps';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from 'helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';
import { randomUUID } from 'node:crypto';
import { TemplateFactory } from 'helpers/factories/template-factory';
import { RoutingPreviewEmailTemplatePage } from 'pages/routing/email/preview-email-page';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';

const routingConfigStorageHelper = new RoutingConfigStorageHelper();
const templateStorageHelper = new TemplateStorageHelper();

const invalidTemplateId = 'invalid-id';
const notFoundTemplateId = '7842c202-a31a-49d8-bdaf-276d64aec4a4';

function createMessagePlans(user: TestUser) {
  return {
    EMAIL_ROUTING_CONFIG: RoutingConfigFactory.createForMessageOrder(
      user,
      'NHSAPP,EMAIL'
    ).dbEntry,
  };
}

function createTemplates(user: TestUser) {
  return {
    EMAIL: TemplateFactory.createEmailTemplate(
      randomUUID(),
      user,
      'Email template name'
    ),
    APP: TemplateFactory.createNhsAppTemplate(
      randomUUID(),
      user,
      'App template name'
    ),
  };
}

test.describe('Routing - Preview email template page', () => {
  let messagePlans: ReturnType<typeof createMessagePlans>;
  let templates: ReturnType<typeof createTemplates>;

  test.beforeAll(async () => {
    const user = await createAuthHelper().getTestUser(testUsers.User1.userId);

    messagePlans = createMessagePlans(user);
    templates = createTemplates(user);

    await routingConfigStorageHelper.seed(Object.values(messagePlans));
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await routingConfigStorageHelper.deleteSeeded();
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new RoutingPreviewEmailTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.EMAIL_ROUTING_CONFIG.id)
        .setPathParam('templateId', templates.EMAIL.id)
        .setSearchParam('lockNumber', '0'),
      baseURL,
      expectedUrl: `templates/message-plans/choose-email-template/${messagePlans.EMAIL_ROUTING_CONFIG.id}?lockNumber=0`,
    };
    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertBackLinkBottom(props);
    await assertAndClickBackLinkTop(props);
  });

  test('loads the email template', async ({ page, baseURL }) => {
    const previewEmailTemplatePage = new RoutingPreviewEmailTemplatePage(page)
      .setPathParam('messagePlanId', messagePlans.EMAIL_ROUTING_CONFIG.id)
      .setPathParam('templateId', templates.EMAIL.id)
      .setSearchParam('lockNumber', '0');

    await previewEmailTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-email-template/${messagePlans.EMAIL_ROUTING_CONFIG.id}/preview-template/${templates.EMAIL.id}?lockNumber=0`
    );

    await expect(previewEmailTemplatePage.pageHeading).toContainText(
      templates.EMAIL.name
    );

    await expect(page.getByText(templates.EMAIL.id)).toBeVisible();

    await expect(page.locator('[id="preview-content-subject"]')).toHaveText(
      templates.EMAIL.subject || ''
    );

    await expect(page.locator('[id="preview-content-message"]')).toHaveText(
      templates.EMAIL.message || ''
    );
  });

  test.describe('redirects to invalid template page', () => {
    test('when template cannot be found', async ({ page, baseURL }) => {
      const previewEmailTemplatePage = new RoutingPreviewEmailTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.EMAIL_ROUTING_CONFIG.id)
        .setPathParam('templateId', notFoundTemplateId)
        .setSearchParam('lockNumber', '0');

      await previewEmailTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when template ID is invalid', async ({ page, baseURL }) => {
      const previewEmailTemplatePage = new RoutingPreviewEmailTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.EMAIL_ROUTING_CONFIG.id)
        .setPathParam('templateId', invalidTemplateId)
        .setSearchParam('lockNumber', '0');

      await previewEmailTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when template is not email', async ({ page, baseURL }) => {
      const previewEmailTemplatePage = new RoutingPreviewEmailTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.EMAIL_ROUTING_CONFIG.id)
        .setPathParam('templateId', templates.APP.id)
        .setSearchParam('lockNumber', '0');

      await previewEmailTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });
  });

  test('redirects to choose-templates page when lockNumber is missing', async ({
    page,
    baseURL,
  }) => {
    const previewEmailTemplatePage = new RoutingPreviewEmailTemplatePage(page)
      .setPathParam('messagePlanId', messagePlans.EMAIL_ROUTING_CONFIG.id)
      .setPathParam('templateId', templates.EMAIL.id);

    await previewEmailTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-templates/${messagePlans.EMAIL_ROUTING_CONFIG.id}`
    );
  });
});
