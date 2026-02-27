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
import { RoutingPreviewOtherLanguageLetterTemplatePage } from 'pages/routing/letter/preview-other-language-letter-template-page';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';

const routingConfigStorageHelper = new RoutingConfigStorageHelper();
const templateStorageHelper = new TemplateStorageHelper();

const invalidTemplateId = 'invalid-id';
const notFoundTemplateId = randomUUID();

const templateIds = {
  EMAIL: randomUUID(),
  STANDARD_LETTER: randomUUID(),
  FRENCH_LETTER: randomUUID(),
  AUTHORING_FRENCH_LETTER: randomUUID(),
};

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
      templateIds.EMAIL,
      user,
      'Email template name'
    ),
    STANDARD_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.STANDARD_LETTER,
      user,
      'Standard letter template name'
    ),
    FRENCH_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.FRENCH_LETTER,
      user,
      'French letter template name',
      'SUBMITTED',
      'PASSED',
      { language: 'fr' }
    ),
    AUTHORING_FRENCH_LETTER: TemplateFactory.createAuthoringLetterTemplate(
      templateIds.AUTHORING_FRENCH_LETTER,
      user,
      'Authoring French letter template name',
      'SUBMITTED',
      { language: 'fr' }
    ),
  };
}

test.describe('Routing - Preview foreign language letter template page', () => {
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
    const previewForeignLanguageLetterTemplatePage =
      new RoutingPreviewOtherLanguageLetterTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
        .setPathParam('templateId', templates.FRENCH_LETTER.id)
        .setSearchParam('lockNumber', '0');
    await previewForeignLanguageLetterTemplatePage.loadPage();

    const props = {
      page: previewForeignLanguageLetterTemplatePage,
      baseURL,
      expectedUrl: `templates/message-plans/choose-other-language-letter-template/${messagePlans.LETTER_ROUTING_CONFIG.id}?lockNumber=0`,
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
    const previewPage = new RoutingPreviewOtherLanguageLetterTemplatePage(page)
      .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
      .setPathParam('templateId', templates.FRENCH_LETTER.id)
      .setSearchParam('lockNumber', String(lockNumber));

    await previewPage.loadPage();

    await expect(previewPage.backLinkTop).toHaveAttribute(
      'href',
      `/templates/message-plans/choose-other-language-letter-template/${messagePlans.LETTER_ROUTING_CONFIG.id}?lockNumber=${lockNumber}`
    );

    await expect(previewPage.backLinkBottom).toHaveAttribute(
      'href',
      `/templates/message-plans/choose-other-language-letter-template/${messagePlans.LETTER_ROUTING_CONFIG.id}?lockNumber=${lockNumber}`
    );

    await previewPage.backLinkTop.click();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-other-language-letter-template/${messagePlans.LETTER_ROUTING_CONFIG.id}?lockNumber=${lockNumber}`
    );
  });

  test('loads the foreign language letter template', async ({
    page,
    baseURL,
  }) => {
    const previewForeignLanguageLetterTemplatePage =
      new RoutingPreviewOtherLanguageLetterTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
        .setPathParam('templateId', templates.FRENCH_LETTER.id)
        .setSearchParam('lockNumber', '0');
    await previewForeignLanguageLetterTemplatePage.loadPage();
    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-other-language-letter-template/${messagePlans.LETTER_ROUTING_CONFIG.id}/preview-template/${templates.FRENCH_LETTER.id}?lockNumber=0`
    );

    await expect(
      previewForeignLanguageLetterTemplatePage.templateCaption
    ).toBeVisible();
    await expect(
      previewForeignLanguageLetterTemplatePage.templateCaption
    ).toContainText('Template');

    await expect(
      previewForeignLanguageLetterTemplatePage.pageHeading
    ).toContainText(templates.FRENCH_LETTER.name);

    await expect(
      previewForeignLanguageLetterTemplatePage.templateId
    ).toBeVisible();
    await expect(
      previewForeignLanguageLetterTemplatePage.templateId
    ).toContainText(templates.FRENCH_LETTER.id);

    await expect(
      previewForeignLanguageLetterTemplatePage.summaryList
    ).toBeVisible();

    expect(templates.FRENCH_LETTER.campaignId).toBeTruthy();

    await expect(
      previewForeignLanguageLetterTemplatePage.campaignId
    ).toContainText(templates.FRENCH_LETTER.campaignId!);

    await expect(
      page.getByText(templates.FRENCH_LETTER.files!.pdfTemplate!.fileName)
    ).toBeVisible();

    await expect(
      page.getByText(templates.FRENCH_LETTER.files!.testDataCsv!.fileName)
    ).toBeVisible();
  });

  test('loads the AUTHORING foreign language letter template', async ({
    page,
    baseURL,
  }) => {
    const previewForeignLanguageLetterTemplatePage =
      new RoutingPreviewOtherLanguageLetterTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
        .setPathParam('templateId', templates.AUTHORING_FRENCH_LETTER.id)
        .setSearchParam('lockNumber', '0');
    await previewForeignLanguageLetterTemplatePage.loadPage();
    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-other-language-letter-template/${messagePlans.LETTER_ROUTING_CONFIG.id}/preview-template/${templates.AUTHORING_FRENCH_LETTER.id}?lockNumber=0`
    );

    await expect(
      previewForeignLanguageLetterTemplatePage.templateCaption
    ).toBeVisible();
    await expect(
      previewForeignLanguageLetterTemplatePage.templateCaption
    ).toContainText('Template');

    await expect(
      previewForeignLanguageLetterTemplatePage.pageHeading
    ).toContainText(templates.AUTHORING_FRENCH_LETTER.name);

    await expect(
      previewForeignLanguageLetterTemplatePage.templateId
    ).toBeVisible();
    await expect(
      previewForeignLanguageLetterTemplatePage.templateId
    ).toContainText(templates.AUTHORING_FRENCH_LETTER.id);

    await expect(
      previewForeignLanguageLetterTemplatePage.summaryList
    ).toBeVisible();

    expect(templates.AUTHORING_FRENCH_LETTER.campaignId).toBeTruthy();

    await expect(
      previewForeignLanguageLetterTemplatePage.campaignId
    ).toContainText(templates.AUTHORING_FRENCH_LETTER.campaignId!);
  });

  test.describe('redirects to invalid template page', () => {
    test('when template cannot be found', async ({ page, baseURL }) => {
      const previewForeignLanguageLetterTemplatePage =
        new RoutingPreviewOtherLanguageLetterTemplatePage(page)
          .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
          .setPathParam('templateId', notFoundTemplateId)
          .setSearchParam('lockNumber', '0');

      await previewForeignLanguageLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when template ID is invalid', async ({ page, baseURL }) => {
      const previewForeignLanguageLetterTemplatePage =
        new RoutingPreviewOtherLanguageLetterTemplatePage(page)
          .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
          .setPathParam('templateId', invalidTemplateId)
          .setSearchParam('lockNumber', '0');

      await previewForeignLanguageLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when template is not a letter', async ({ page, baseURL }) => {
      const previewForeignLanguageLetterTemplatePage =
        new RoutingPreviewOtherLanguageLetterTemplatePage(page)
          .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
          .setPathParam('templateId', templates.EMAIL.id)
          .setSearchParam('lockNumber', '0');

      await previewForeignLanguageLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when template is a standard English letter', async ({
      page,
      baseURL,
    }) => {
      const previewForeignLanguageLetterTemplatePage =
        new RoutingPreviewOtherLanguageLetterTemplatePage(page)
          .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
          .setPathParam('templateId', templates.STANDARD_LETTER.id)
          .setSearchParam('lockNumber', '0');

      await previewForeignLanguageLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });
  });

  test('redirects to the edit message plan page when lockNumber is missing', async ({
    page,
    baseURL,
  }) => {
    const previewForeignLanguageLetterTemplatePage =
      new RoutingPreviewOtherLanguageLetterTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
        .setPathParam('templateId', templates.FRENCH_LETTER.id);

    await previewForeignLanguageLetterTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/edit-message-plan/${messagePlans.LETTER_ROUTING_CONFIG.id}`
    );
  });
});
