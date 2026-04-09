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
import { RoutingPreviewMessagePlanPreviewLetterTemplatePage } from 'pages/routing/preview-message-plan-letter-template-page';
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
  LETTER: randomUUID(),
  LETTER_WITHOUT_VARIANT: randomUUID(),
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
      `Test Email template - ${templateIds.EMAIL}`
    ),
    LETTER: TemplateFactory.createAuthoringLetterTemplate(
      templateIds.LETTER,
      user,
      `Test Letter template - ${templateIds.LETTER}`,
      'PROOF_APPROVED',
      {
        letterVariantId: letterVariant.id,
        longFormRender: { status: 'RENDERED' },
        shortFormRender: { status: 'RENDERED' },
      }
    ),
    LETTER_WITHOUT_VARIANT: TemplateFactory.createAuthoringLetterTemplate(
      templateIds.LETTER_WITHOUT_VARIANT,
      user,
      `Test Letter template no variant - ${templateIds.LETTER_WITHOUT_VARIANT}`,
      'PROOF_APPROVED',
      {
        longFormRender: { status: 'RENDERED' },
        shortFormRender: { status: 'RENDERED' },
      }
    ),
  };
}

test.describe('Routing - Preview Message Plan / Preview Letter template page', () => {
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
    const props = {
      page: new RoutingPreviewMessagePlanPreviewLetterTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
        .setPathParam('templateId', templates.LETTER.id),
      baseURL,
    };
    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
  });

  test('loads the letter template', async ({ page, baseURL }) => {
    const previewLetterTemplatePage =
      new RoutingPreviewMessagePlanPreviewLetterTemplatePage(page)
        .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
        .setPathParam('templateId', templates.LETTER.id);

    await previewLetterTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/preview-message-plan/${messagePlans.LETTER_ROUTING_CONFIG.id}/preview-template/${templates.LETTER.id}`
    );

    await expect(previewLetterTemplatePage.pageHeading).toContainText(
      templates.LETTER.name
    );

    expect(templates.LETTER.campaignId).toBeTruthy();

    await expect(previewLetterTemplatePage.campaignId).toContainText(
      templates.LETTER.campaignId!
    );

    await expect(previewLetterTemplatePage.templateId).toBeVisible();
    await expect(previewLetterTemplatePage.templateId).toContainText(
      templates.LETTER.id
    );

    await expect(previewLetterTemplatePage.summaryList).toBeVisible();

    await expect(previewLetterTemplatePage.letterPreviewHeading).toBeVisible();
    await expect(previewLetterTemplatePage.letterPreviewIframe).toBeVisible();

    await expect(previewLetterTemplatePage.letterPreviewIframe).toHaveAttribute(
      'src',
      `/templates/files/${templates.LETTER.clientId}/renders/${templates.LETTER.id}/initial-render.pdf`
    );
  });

  test.describe('redirects to invalid template page', () => {
    test('when template cannot be found', async ({ page, baseURL }) => {
      const previewLetterTemplatePage =
        new RoutingPreviewMessagePlanPreviewLetterTemplatePage(page)
          .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
          .setPathParam('templateId', notFoundTemplateId);

      await previewLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when template ID is invalid', async ({ page, baseURL }) => {
      const previewLetterTemplatePage =
        new RoutingPreviewMessagePlanPreviewLetterTemplatePage(page)
          .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
          .setPathParam('templateId', invalidTemplateId);

      await previewLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when template is not a letter', async ({ page, baseURL }) => {
      const previewLetterTemplatePage =
        new RoutingPreviewMessagePlanPreviewLetterTemplatePage(page)
          .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
          .setPathParam('templateId', templates.EMAIL.id);

      await previewLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when template does not have a letterVariantId', async ({
      page,
      baseURL,
    }) => {
      const previewLetterTemplatePage =
        new RoutingPreviewMessagePlanPreviewLetterTemplatePage(page)
          .setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id)
          .setPathParam('templateId', templates.LETTER_WITHOUT_VARIANT.id);

      await previewLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });
  });
});
