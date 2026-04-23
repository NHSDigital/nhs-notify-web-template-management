import { test, expect } from '@playwright/test';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertAndClickBackLinkTop,
  assertBackLinkBottom,
} from '../../helpers/template-mgmt-common.steps';
import { TestUser, testUsers } from 'helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';
import { randomUUID } from 'node:crypto';
import { TemplateFactory } from 'helpers/factories/template-factory';
import { RoutingPreviewOtherLanguageLetterTemplatePage } from 'pages/routing/letter/preview-other-language-letter-template-page';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import { getTestContext } from 'helpers/context/context';
import { LetterVariant } from 'nhs-notify-web-template-management-types';

const routingConfigStorageHelper = new RoutingConfigStorageHelper();
const templateStorageHelper = new TemplateStorageHelper();

const invalidTemplateId = 'invalid-id';
const notFoundTemplateId = randomUUID();

const templateIds = {
  EMAIL: randomUUID(),
  STANDARD_LETTER: randomUUID(),
  AUTHORING_FRENCH_LETTER: randomUUID(),
  FRENCH_LETTER_WITHOUT_VARIANT: randomUUID(),
};

function createMessagePlans(user: TestUser) {
  return {
    LETTER_ROUTING_CONFIG: RoutingConfigFactory.createForMessageOrder(
      user,
      'LETTER'
    ).dbEntry,
  };
}

function createTemplates(user: TestUser, letterVariant: LetterVariant) {
  return {
    EMAIL: TemplateFactory.createEmailTemplate(
      templateIds.EMAIL,
      user,
      `Email template name - ${templateIds.EMAIL}`
    ),
    STANDARD_LETTER: TemplateFactory.createAuthoringLetterTemplate(
      templateIds.STANDARD_LETTER,
      user,
      `Standard letter template name - ${templateIds.STANDARD_LETTER}`,
      'PROOF_APPROVED',
      {
        shortFormRender: { status: 'RENDERED' },
        longFormRender: { status: 'RENDERED' },
        letterVariantId: letterVariant.id,
      }
    ),
    FRENCH_LETTER: TemplateFactory.createAuthoringLetterTemplate(
      templateIds.AUTHORING_FRENCH_LETTER,
      user,
      `French letter template name - ${templateIds.AUTHORING_FRENCH_LETTER}`,
      'SUBMITTED',
      {
        language: 'fr',
        shortFormRender: { status: 'RENDERED' },
        longFormRender: { status: 'RENDERED' },
        letterVariantId: letterVariant.id,
      }
    ),
    FRENCH_LETTER_WITHOUT_VARIANT:
      TemplateFactory.createAuthoringLetterTemplate(
        templateIds.FRENCH_LETTER_WITHOUT_VARIANT,
        user,
        `French letter template no variant - ${templateIds.FRENCH_LETTER_WITHOUT_VARIANT}`,
        'PROOF_APPROVED',
        {
          language: 'fr',
          shortFormRender: { status: 'RENDERED' },
          longFormRender: { status: 'RENDERED' },
        }
      ),
  };
}

test.describe('Routing - Preview foreign language letter template page', () => {
  let messagePlans: ReturnType<typeof createMessagePlans>;
  let templates: ReturnType<typeof createTemplates>;

  test.beforeAll(async () => {
    const context = getTestContext();
    const user = await context.auth.getTestUser(testUsers.User1.userId);

    const [globalLetterVariant] =
      await context.letterVariants.getGlobalLetterVariants();

    messagePlans = createMessagePlans(user);
    templates = createTemplates(user, globalLetterVariant);

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

    await expect(
      previewForeignLanguageLetterTemplatePage.letterPreviewHeading
    ).toBeVisible();
    await expect(
      previewForeignLanguageLetterTemplatePage.letterPreviewIframe
    ).toBeVisible();

    await expect(
      previewForeignLanguageLetterTemplatePage.letterPreviewIframe
    ).toHaveAttribute(
      'src',
      `/templates/files/${templates.FRENCH_LETTER.clientId}/renders/${templates.FRENCH_LETTER.id}/initial-render.pdf`
    );
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

    test('when template does not have a letterVariantId', async ({
      page,
      baseURL,
    }) => {
      const previewForeignLanguageLetterTemplatePage =
        new RoutingPreviewOtherLanguageLetterTemplatePage(page)
          .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
          .setPathParam(
            'templateId',
            templates.FRENCH_LETTER_WITHOUT_VARIANT.id
          )
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
