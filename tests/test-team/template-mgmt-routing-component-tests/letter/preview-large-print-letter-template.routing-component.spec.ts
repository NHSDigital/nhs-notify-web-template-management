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
import { RoutingPreviewLargePrintLetterTemplatePage } from 'pages/routing/letter/preview-large-print-letter-template-page';
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
    STANDARD_LETTER: TemplateFactory.uploadLetterTemplate(
      randomUUID(),
      user,
      'Standard letter template name'
    ),
    LARGE_PRINT_LETTER: TemplateFactory.uploadLetterTemplate(
      randomUUID(),
      user,
      'Large print letter template name',
      'SUBMITTED',
      'PASSED',
      { letterType: 'x1' }
    ),
  };
}

test.describe('Routing - Preview large print letter template page', () => {
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
      page: new RoutingPreviewLargePrintLetterTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
        .setPathParam('templateId', templates.LARGE_PRINT_LETTER.id)
        .setSearchParam('lockNumber', '0'),
      baseURL,
      expectedUrl: `templates/message-plans/choose-large-print-letter-template/${messagePlans.LETTER_ROUTING_CONFIG.id}?lockNumber=0`,
    };
    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertBackLinkBottom(props);
    await assertAndClickBackLinkTop(props);
  });

  test('back links preserve lockNumber query parameter', async ({
    page,
    baseURL,
  }) => {
    const lockNumber = 5;
    const previewPage = new RoutingPreviewLargePrintLetterTemplatePage(page)
      .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
      .setPathParam('templateId', templates.LARGE_PRINT_LETTER.id)
      .setSearchParam('lockNumber', String(lockNumber));

    await previewPage.loadPage();

    await expect(previewPage.backLinkTop).toHaveAttribute(
      'href',
      `/templates/message-plans/choose-large-print-letter-template/${messagePlans.LETTER_ROUTING_CONFIG.id}?lockNumber=${lockNumber}`
    );

    await expect(previewPage.backLinkBottom).toHaveAttribute(
      'href',
      `/templates/message-plans/choose-large-print-letter-template/${messagePlans.LETTER_ROUTING_CONFIG.id}?lockNumber=${lockNumber}`
    );

    await previewPage.backLinkTop.click();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-large-print-letter-template/${messagePlans.LETTER_ROUTING_CONFIG.id}?lockNumber=${lockNumber}`
    );
  });

  test('loads the large print letter template', async ({ page, baseURL }) => {
    const previewLargePrintLetterTemplatePage =
      new RoutingPreviewLargePrintLetterTemplatePage(page);
    await previewLargePrintLetterTemplatePage
      .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
      .setPathParam('templateId', templates.LARGE_PRINT_LETTER.id)
      .setSearchParam('lockNumber', '0')
      .loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-large-print-letter-template/${messagePlans.LETTER_ROUTING_CONFIG.id}/preview-template/${templates.LARGE_PRINT_LETTER.id}?lockNumber=0`
    );

    await expect(
      previewLargePrintLetterTemplatePage.templateCaption
    ).toContainText('Template');

    await expect(previewLargePrintLetterTemplatePage.pageHeading).toContainText(
      templates.LARGE_PRINT_LETTER.name
    );

    await expect(previewLargePrintLetterTemplatePage.templateId).toBeVisible();
    await expect(previewLargePrintLetterTemplatePage.templateId).toContainText(
      templates.LARGE_PRINT_LETTER.id
    );

    await expect(previewLargePrintLetterTemplatePage.summaryList).toBeVisible();

    if (
      !templates.LARGE_PRINT_LETTER.campaignId ||
      !templates.LARGE_PRINT_LETTER.files?.pdfTemplate?.fileName ||
      !templates.LARGE_PRINT_LETTER.files?.testDataCsv?.fileName
    ) {
      throw new Error('Test data misconfiguration');
    }

    await expect(previewLargePrintLetterTemplatePage.campaignId).toContainText(
      templates.LARGE_PRINT_LETTER.campaignId
    );

    await expect(
      page.getByText(templates.LARGE_PRINT_LETTER.files!.pdfTemplate!.fileName)
    ).toBeVisible();

    await expect(
      page.getByText(templates.LARGE_PRINT_LETTER.files!.testDataCsv!.fileName)
    ).toBeVisible();
  });

  test.describe('redirects to invalid template page', () => {
    test('when template cannot be found', async ({ page, baseURL }) => {
      const previewLargePrintLetterTemplatePage =
        new RoutingPreviewLargePrintLetterTemplatePage(page);

      await previewLargePrintLetterTemplatePage
        .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
        .setPathParam('templateId', notFoundTemplateId)
        .setSearchParam('lockNumber', '0')
        .loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when template ID is invalid', async ({ page, baseURL }) => {
      const previewLargePrintLetterTemplatePage =
        new RoutingPreviewLargePrintLetterTemplatePage(page);

      await previewLargePrintLetterTemplatePage
        .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
        .setPathParam('templateId', invalidTemplateId)
        .setSearchParam('lockNumber', '0')
        .loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when template is not a letter', async ({ page, baseURL }) => {
      const previewLargePrintLetterTemplatePage =
        new RoutingPreviewLargePrintLetterTemplatePage(page);

      await previewLargePrintLetterTemplatePage
        .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
        .setPathParam('templateId', templates.EMAIL.id)
        .setSearchParam('lockNumber', '0')
        .loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when template is a standard English letter', async ({
      page,
      baseURL,
    }) => {
      const previewLargePrintLetterTemplatePage =
        new RoutingPreviewLargePrintLetterTemplatePage(page);

      await previewLargePrintLetterTemplatePage
        .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
        .setPathParam('templateId', templates.STANDARD_LETTER.id)
        .setSearchParam('lockNumber', '0')
        .loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });
  });

  test('redirects to choose-templates page when lockNumber is missing', async ({
    page,
    baseURL,
  }) => {
    const previewLargePrintLetterTemplatePage =
      new RoutingPreviewLargePrintLetterTemplatePage(page);

    await previewLargePrintLetterTemplatePage
      .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
      .setPathParam('templateId', templates.LARGE_PRINT_LETTER.id)
      .loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-templates/${messagePlans.LETTER_ROUTING_CONFIG.id}`
    );
  });
});
