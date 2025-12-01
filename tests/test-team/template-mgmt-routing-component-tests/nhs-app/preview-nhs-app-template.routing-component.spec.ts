import { test, expect } from '@playwright/test';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertGoBackLink,
} from '../../helpers/template-mgmt-common.steps';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from 'helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';
import { randomUUID } from 'node:crypto';
import { TemplateFactory } from 'helpers/factories/template-factory';
import { RoutingPreviewNhsAppTemplatePage } from 'pages/routing/nhs-app/preview-nhs-app-page';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';

const routingConfigStorageHelper = new RoutingConfigStorageHelper();
const templateStorageHelper = new TemplateStorageHelper();

const invalidTemplateId = 'invalid-id';
const notFoundTemplateId = '581c4a83-8846-4737-bb11-963225295750';

function createMessagePlans(user: TestUser) {
  return {
    APP_ROUTING_CONFIG: RoutingConfigFactory.createForMessageOrder(
      user,
      'NHSAPP'
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

test.describe('Routing - Preview app template page', () => {
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
      page: new RoutingPreviewNhsAppTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.APP_ROUTING_CONFIG.id)
        .setPathParam('templateId', templates.APP.id),
      baseURL,
      expectedUrl: `templates/message-plans/choose-nhs-app-template/${messagePlans.APP_ROUTING_CONFIG.id}`,
    };
    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertGoBackLink(props);
  });

  test('loads the NHS app template', async ({ page, baseURL }) => {
    const previewNhsAppTemplatePage = new RoutingPreviewNhsAppTemplatePage(page)
      .setPathParam('messagePlanId', messagePlans.APP_ROUTING_CONFIG.id)
      .setPathParam('templateId', templates.APP.id);

    await previewNhsAppTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-nhs-app-template/${messagePlans.APP_ROUTING_CONFIG.id}/preview-template/${templates.APP.id}`
    );

    await expect(previewNhsAppTemplatePage.pageHeading).toContainText(
      templates.APP.name
    );

    await expect(page.getByText(templates.APP.id)).toBeVisible();

    await expect(page.locator('[id="preview-content-message"]')).toHaveText(
      templates.APP.message || ''
    );
  });

  test.describe('redirects to invalid template page', () => {
    test('when template cannot be found', async ({ page, baseURL }) => {
      const previewNhsAppTemplatePage = new RoutingPreviewNhsAppTemplatePage(
        page
      )
        .setPathParam('messagePlanId', messagePlans.APP_ROUTING_CONFIG.id)
        .setPathParam('templateId', notFoundTemplateId);

      await previewNhsAppTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when template ID is invalid', async ({ page, baseURL }) => {
      const previewNhsAppTemplatePage = new RoutingPreviewNhsAppTemplatePage(
        page
      )
        .setPathParam('messagePlanId', messagePlans.APP_ROUTING_CONFIG.id)
        .setPathParam('templateId', invalidTemplateId);

      await previewNhsAppTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when template is not NHS app', async ({ page, baseURL }) => {
      const previewNhsAppTemplatePage = new RoutingPreviewNhsAppTemplatePage(
        page
      )
        .setPathParam('messagePlanId', messagePlans.APP_ROUTING_CONFIG.id)
        .setPathParam('templateId', templates.EMAIL.id);

      await previewNhsAppTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });
  });
});
