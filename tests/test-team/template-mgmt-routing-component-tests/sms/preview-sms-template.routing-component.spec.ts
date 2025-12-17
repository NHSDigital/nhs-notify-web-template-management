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
import { RoutingPreviewSmsTemplatePage } from 'pages/routing/sms/preview-sms-template-page';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';

const routingConfigStorageHelper = new RoutingConfigStorageHelper();
const templateStorageHelper = new TemplateStorageHelper();

const invalidTemplateId = 'invalid-id';
const notFoundTemplateId = 'cbb6fa2b-2019-493c-b4b9-edad6cfa2196';

function createMessagePlans(user: TestUser) {
  return {
    SMS_ROUTING_CONFIG: RoutingConfigFactory.createForMessageOrder(
      user,
      'NHSAPP,SMS'
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
    SMS: TemplateFactory.createSmsTemplate(
      randomUUID(),
      user,
      'SMS template name'
    ),
  };
}

test.describe('Routing - Preview SMS template page', () => {
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
      page: new RoutingPreviewSmsTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.SMS_ROUTING_CONFIG.id)
        .setPathParam('templateId', templates.SMS.id)
        .setSearchParam('lockNumber', '0'),
      baseURL,
      expectedUrl: `templates/message-plans/choose-text-message-template/${messagePlans.SMS_ROUTING_CONFIG.id}?lockNumber=0`,
    };
    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertBackLinkBottom(props);
    await assertAndClickBackLinkTop(props);
  });

  test('loads the SMS template', async ({ page, baseURL }) => {
    const previewSmsTemplatePage = new RoutingPreviewSmsTemplatePage(page)
      .setPathParam('messagePlanId', messagePlans.SMS_ROUTING_CONFIG.id)
      .setPathParam('templateId', templates.SMS.id)
      .setSearchParam('lockNumber', '0');

    await previewSmsTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-text-message-template/${messagePlans.SMS_ROUTING_CONFIG.id}/preview-template/${templates.SMS.id}?lockNumber=0`
    );

    await expect(previewSmsTemplatePage.pageHeading).toContainText(
      templates.SMS.name
    );

    await expect(page.getByText(templates.SMS.id)).toBeVisible();

    await expect(page.locator('[id="preview-content-message"]')).toHaveText(
      templates.SMS.message || ''
    );
  });

  test.describe('redirects to invalid template page', () => {
    test('when template cannot be found', async ({ page, baseURL }) => {
      const previewSmsTemplatePage = new RoutingPreviewSmsTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.SMS_ROUTING_CONFIG.id)
        .setPathParam('templateId', notFoundTemplateId)
        .setSearchParam('lockNumber', '0');

      await previewSmsTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when template ID is invalid', async ({ page, baseURL }) => {
      const previewSmsTemplatePage = new RoutingPreviewSmsTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.SMS_ROUTING_CONFIG.id)
        .setPathParam('templateId', invalidTemplateId)
        .setSearchParam('lockNumber', '0');

      await previewSmsTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when template is not SMS', async ({ page, baseURL }) => {
      const previewSmsTemplatePage = new RoutingPreviewSmsTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.SMS_ROUTING_CONFIG.id)
        .setPathParam('templateId', templates.EMAIL.id)
        .setSearchParam('lockNumber', '0');

      await previewSmsTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });
  });
});
