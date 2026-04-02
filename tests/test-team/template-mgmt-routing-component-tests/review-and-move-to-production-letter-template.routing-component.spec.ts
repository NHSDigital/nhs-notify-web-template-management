import { test, expect } from '@playwright/test';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
} from 'helpers/template-mgmt-common.steps';
import { TestUser, testUsers } from 'helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';
import { randomUUID } from 'node:crypto';
import { TemplateFactory } from 'helpers/factories/template-factory';
import { RoutingReviewAndMoveToProductionLetterTemplatePage } from 'pages/routing/review-and-move-to-production-letter-template-page';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import { getTestContext } from 'helpers/context/context';

const routingConfigStorageHelper = new RoutingConfigStorageHelper();
const templateStorageHelper = new TemplateStorageHelper();

const invalidTemplateId = 'invalid-id';
const notFoundTemplateId = 'dc67b576-af7d-47b3-97d7-48fa204e7525';

function createMessagePlans(user: TestUser) {
  return {
    LETTER_ROUTING_CONFIG: RoutingConfigFactory.createForMessageOrder(
      user,
      'LETTER'
    ).dbEntry,
  };
}

function createTemplates(user: TestUser) {
  const templateIds = {
    EMAIL: randomUUID(),
    AUTHORING_LETTER: randomUUID(),
    PDF_LETTER: randomUUID(),
  };

  return {
    EMAIL: TemplateFactory.createEmailTemplate(
      templateIds.EMAIL,
      user,
      `Test Email template - ${templateIds.EMAIL}`
    ),
    AUTHORING_LETTER: TemplateFactory.createAuthoringLetterTemplate(
      templateIds.AUTHORING_LETTER,
      user,
      `Test Authoring Letter template - ${templateIds.AUTHORING_LETTER}`
    ),
    PDF_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.PDF_LETTER,
      user,
      `Test PDF Letter template - ${templateIds.PDF_LETTER}`
    ),
  };
}

test.describe('Routing - Review and Move to Production Letter template page', () => {
  let messagePlans: ReturnType<typeof createMessagePlans>;
  let templates: ReturnType<typeof createTemplates>;

  test.beforeAll(async () => {
    const context = getTestContext();
    const user = await context.auth.getTestUser(testUsers.User1.userId);

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
      page: new RoutingReviewAndMoveToProductionLetterTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
        .setPathParam('templateId', templates.AUTHORING_LETTER.id),
      baseURL,
    };
    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
  });

  test('loads the AUTHORING letter template', async ({ page, baseURL }) => {
    const previewLetterTemplatePage =
      new RoutingReviewAndMoveToProductionLetterTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
        .setPathParam('templateId', templates.AUTHORING_LETTER.id);

    await previewLetterTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/review-and-move-to-production/${messagePlans.LETTER_ROUTING_CONFIG.id}/preview-template/${templates.AUTHORING_LETTER.id}`
    );

    await expect(previewLetterTemplatePage.pageHeading).toContainText(
      templates.AUTHORING_LETTER.name
    );

    expect(templates.AUTHORING_LETTER.campaignId).toBeTruthy();

    await expect(previewLetterTemplatePage.campaignId).toContainText(
      templates.AUTHORING_LETTER.campaignId!
    );

    await expect(previewLetterTemplatePage.templateId).toBeVisible();
    await expect(previewLetterTemplatePage.templateId).toContainText(
      templates.AUTHORING_LETTER.id
    );

    await expect(previewLetterTemplatePage.summaryList).toBeVisible();

    await expect(previewLetterTemplatePage.letterPreviewHeading).toBeVisible();
    await expect(previewLetterTemplatePage.letterPreviewIframe).toBeVisible();

    await expect(previewLetterTemplatePage.letterPreviewIframe).toHaveAttribute(
      'src',
      `/templates/files/${templates.AUTHORING_LETTER.clientId}/renders/${templates.AUTHORING_LETTER.id}/initial-render.pdf`
    );
  });

  test.describe('redirects to invalid template page', () => {
    test('when template cannot be found', async ({ page, baseURL }) => {
      const previewLetterTemplatePage =
        new RoutingReviewAndMoveToProductionLetterTemplatePage(page)
          .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
          .setPathParam('templateId', notFoundTemplateId);

      await previewLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when template ID is invalid', async ({ page, baseURL }) => {
      const previewLetterTemplatePage =
        new RoutingReviewAndMoveToProductionLetterTemplatePage(page)
          .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
          .setPathParam('templateId', invalidTemplateId);

      await previewLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when template is not letter', async ({ page, baseURL }) => {
      const previewLetterTemplatePage =
        new RoutingReviewAndMoveToProductionLetterTemplatePage(page)
          .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
          .setPathParam('templateId', templates.EMAIL.id);

      await previewLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when template is a PDF letter', async ({ page, baseURL }) => {
      const previewLetterTemplatePage =
        new RoutingReviewAndMoveToProductionLetterTemplatePage(page)
          .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
          .setPathParam('templateId', templates.PDF_LETTER.id);

      await previewLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });
  });
});
