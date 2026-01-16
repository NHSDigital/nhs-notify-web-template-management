import { test, expect } from '@playwright/test';
import { RoutingPreviewMessagePlanPage } from 'pages/routing/preview-message-plan-page';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertNoBackLinks,
  assertBackLinkTop,
  assertBackLinkBottom,
} from '../helpers/template-mgmt-common.steps';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from 'helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';
import { randomUUID } from 'node:crypto';
import { TemplateFactory } from 'helpers/factories/template-factory';

const routingConfigStorageHelper = new RoutingConfigStorageHelper();
const templateStorageHelper = new TemplateStorageHelper();

function createTemplates(user: TestUser) {
  const templateIds = {
    NHSAPP: randomUUID(),
    EMAIL: randomUUID(),
    SMS: randomUUID(),
    LETTER: randomUUID(),
    LARGE_PRINT_LETTER: randomUUID(),
    FRENCH_LETTER: randomUUID(),
    SPANISH_LETTER: randomUUID(),
  };

  return {
    NHSAPP: TemplateFactory.createNhsAppTemplate(
      templateIds.NHSAPP,
      user,
      `Test NHS App template - ${templateIds.NHSAPP}`
    ),
    EMAIL: TemplateFactory.createEmailTemplate(
      templateIds.EMAIL,
      user,
      `Test Email template - ${templateIds.EMAIL}`
    ),
    SMS: TemplateFactory.createSmsTemplate(
      templateIds.SMS,
      user,
      `Test SMS template - ${templateIds.SMS}`
    ),
    LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.LETTER,
      user,
      `Test Letter template - ${templateIds.LETTER}`
    ),
    LARGE_PRINT_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.LARGE_PRINT_LETTER,
      user,
      `Test Large Print Letter template - ${templateIds.LARGE_PRINT_LETTER}`,
      'NOT_YET_SUBMITTED',
      'PASSED',
      { letterType: 'x1' }
    ),
    FRENCH_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.FRENCH_LETTER,
      user,
      `Test Letter template French - ${templateIds.FRENCH_LETTER}`,
      'NOT_YET_SUBMITTED',
      'PASSED',
      { language: 'fr' }
    ),
    SPANISH_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.SPANISH_LETTER,
      user,
      `Test Spanish Letter template - ${templateIds.SPANISH_LETTER}`,
      'NOT_YET_SUBMITTED',
      'PASSED',
      { language: 'es' }
    ),
  };
}

test.describe('Routing - Preview Message Plan page', () => {
  let templates: ReturnType<typeof createTemplates>;

  let user: TestUser;

  test.beforeAll(async () => {
    user = await createAuthHelper().getTestUser(testUsers.User1.userId);
    templates = createTemplates(user);

    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await routingConfigStorageHelper.deleteSeeded();
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('common page tests', async ({ page, baseURL }) => {
    const { dbEntry } = RoutingConfigFactory.createWithChannels(
      user,
      ['NHSAPP'],
      { status: 'COMPLETED' }
    ).addTemplate('NHSAPP', templates.NHSAPP.id);

    await routingConfigStorageHelper.seed([dbEntry]);

    const props = {
      page: new RoutingPreviewMessagePlanPage(page).setPathParam(
        'messagePlanId',
        dbEntry.id
      ),
      baseURL,
      expectedUrl: 'templates/message-plans',
    };
    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertBackLinkTop(props);
    await assertBackLinkBottom(props);
  });

  test('redirects to invalid message plan page when message plan cannot be found', async ({
    page,
    baseURL,
  }) => {
    const previewMessagePlanPage = new RoutingPreviewMessagePlanPage(
      page
    ).setPathParam('messagePlanId', 'does-not-exist');

    await previewMessagePlanPage.loadPage();

    await expect(page).toHaveURL(`${baseURL}/templates/message-plans/invalid`);
  });

  test('redirects to choose templates message plan page when message plan is in draft', async ({
    page,
    baseURL,
  }) => {
    const { dbEntry } = RoutingConfigFactory.createWithChannels(
      user,
      ['NHSAPP'],
      { status: 'DRAFT' }
    ).addTemplate('NHSAPP', templates.NHSAPP.id);

    await routingConfigStorageHelper.seed([dbEntry]);

    const previewMessagePlanPage = new RoutingPreviewMessagePlanPage(
      page
    ).setPathParam('messagePlanId', dbEntry.id);

    await previewMessagePlanPage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-templates/${dbEntry.id}`
    );
  });

  test('full routing config', async ({ page }) => {
    const { dbEntry } = RoutingConfigFactory.createWithChannels(
      user,
      ['NHSAPP', 'EMAIL', 'SMS', 'LETTER'],
      { status: 'COMPLETED' }
    )
      .addTemplate('NHSAPP', templates.NHSAPP.id)
      .addTemplate('EMAIL', templates.EMAIL.id)
      .addTemplate('SMS', templates.SMS.id)
      .addTemplate('LETTER', templates.LETTER.id)
      .addAccessibleFormatTemplate('x1', templates.LARGE_PRINT_LETTER.id)
      .addLanguageTemplate('fr', templates.FRENCH_LETTER.id)
      .addLanguageTemplate('es', templates.SPANISH_LETTER.id);

    await routingConfigStorageHelper.seed([dbEntry]);

    const previewMessagePlanPage = new RoutingPreviewMessagePlanPage(
      page
    ).setPathParam('messagePlanId', dbEntry.id);

    await previewMessagePlanPage.loadPage();

    test.step('shows message plan details', () => {
      expect(previewMessagePlanPage.pageHeading).toHaveText(dbEntry.name);

      // TODO: CCM-12038 - id, campaign id, status
    });

    test.step('has link to copy the message plan', () => {
      expect(previewMessagePlanPage.copyLink).toHaveAttribute(
        'href',
        `/message-plans/copy-message-plan/${dbEntry.id}`
      );
    });

    // TODO: CCM-12038 - assert on each part of the cascade
  });
});
