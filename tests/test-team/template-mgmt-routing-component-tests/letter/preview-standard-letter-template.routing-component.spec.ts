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
import { RoutingPreviewStandardLetterTemplatePage } from 'pages/routing/letter/preview-standard-letter-page';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';

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
  return {
    EMAIL: TemplateFactory.createEmailTemplate(
      randomUUID(),
      user,
      'Email template name'
    ),
    LETTER: TemplateFactory.uploadLetterTemplate(
      randomUUID(),
      user,
      'Letter template name'
    ),
    AUTHORING_LETTER: TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      user,
      'Authoring letter template name'
    ),
  };
}

test.describe('Routing - Preview Letter template page', () => {
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
      page: new RoutingPreviewStandardLetterTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
        .setPathParam('templateId', templates.LETTER.id)
        .setSearchParam('lockNumber', '0'),
      baseURL,
      expectedUrl: `templates/message-plans/choose-standard-english-letter-template/${messagePlans.LETTER_ROUTING_CONFIG.id}?lockNumber=0`,
    };
    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertBackLinkBottom(props);
    await assertAndClickBackLinkTop(props);
  });

  test('loads the Letter template', async ({ page, baseURL }) => {
    const previewLetterTemplatePage =
      new RoutingPreviewStandardLetterTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
        .setPathParam('templateId', templates.LETTER.id)
        .setSearchParam('lockNumber', '0');

    await previewLetterTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-standard-english-letter-template/${messagePlans.LETTER_ROUTING_CONFIG.id}/preview-template/${templates.LETTER.id}?lockNumber=0`
    );

    await expect(previewLetterTemplatePage.pageHeading).toContainText(
      templates.LETTER.name
    );

    if (
      !templates.LETTER.campaignId ||
      !templates.LETTER.files?.pdfTemplate?.fileName ||
      !templates.LETTER.files?.testDataCsv?.fileName
    ) {
      throw new Error('Test data misconfiguration');
    }

    await expect(previewLetterTemplatePage.campaignId).toContainText(
      templates.LETTER.campaignId
    );

    await expect(
      page.getByText(templates.LETTER.files!.pdfTemplate!.fileName)
    ).toBeVisible();

    await expect(
      page.getByText(templates.LETTER.files!.testDataCsv!.fileName)
    ).toBeVisible();
  });

  test('loads the AUTHORING letter template', async ({ page, baseURL }) => {
    const previewLetterTemplatePage =
      new RoutingPreviewStandardLetterTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
        .setPathParam('templateId', templates.AUTHORING_LETTER.id)
        .setSearchParam('lockNumber', '0');

    await previewLetterTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-standard-english-letter-template/${messagePlans.LETTER_ROUTING_CONFIG.id}/preview-template/${templates.AUTHORING_LETTER.id}?lockNumber=0`
    );

    await expect(previewLetterTemplatePage.pageHeading).toContainText(
      templates.AUTHORING_LETTER.name
    );

    if (!templates.AUTHORING_LETTER.campaignId) {
      throw new Error('Test data misconfiguration');
    }

    await expect(previewLetterTemplatePage.campaignId).toContainText(
      templates.AUTHORING_LETTER.campaignId
    );

    await expect(previewLetterTemplatePage.templateId).toBeVisible();
    await expect(previewLetterTemplatePage.templateId).toContainText(
      templates.AUTHORING_LETTER.id
    );

    await expect(previewLetterTemplatePage.summaryList).toBeVisible();
  });

  test.describe('redirects to invalid template page', () => {
    test('when template cannot be found', async ({ page, baseURL }) => {
      const previewLetterTemplatePage =
        new RoutingPreviewStandardLetterTemplatePage(page)
          .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
          .setPathParam('templateId', notFoundTemplateId)
          .setSearchParam('lockNumber', '0');

      await previewLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when template ID is invalid', async ({ page, baseURL }) => {
      const previewLetterTemplatePage =
        new RoutingPreviewStandardLetterTemplatePage(page)
          .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
          .setPathParam('templateId', invalidTemplateId)
          .setSearchParam('lockNumber', '0');

      await previewLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when template is not letter', async ({ page, baseURL }) => {
      const previewLetterTemplatePage =
        new RoutingPreviewStandardLetterTemplatePage(page)
          .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
          .setPathParam('templateId', templates.EMAIL.id)
          .setSearchParam('lockNumber', '0');

      await previewLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });
  });

  test('redirects to choose-templates page when lockNumber is missing', async ({
    page,
    baseURL,
  }) => {
    const previewLetterTemplatePage =
      new RoutingPreviewStandardLetterTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
        .setPathParam('templateId', templates.LETTER.id);

    await previewLetterTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-templates/${messagePlans.LETTER_ROUTING_CONFIG.id}`
    );
  });
});
