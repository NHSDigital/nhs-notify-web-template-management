import { randomUUID } from 'node:crypto';
import { expect } from '@playwright/test';
import { TestUser, testUsers } from 'helpers/auth/cognito-auth-helper';
import { loginAsUser } from 'helpers/auth/login-as-user';
import { TemplateFactory } from 'helpers/factories/template-factory';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import { getAppRoutes } from 'helpers/get-app-routes';
import { test } from 'fixtures/accessibility-analyze';
import {
  RoutingChooseEmailTemplatePage,
  RoutingChooseLargePrintLetterTemplatePage,
  RoutingChooseMessageOrderPage,
  RoutingChooseNhsAppTemplatePage,
  RoutingChooseOtherLanguageLetterTemplatePage,
  RoutingChooseStandardLetterTemplatePage,
  RoutingChooseTemplatesPage,
  RoutingChooseTextMessageTemplatePage,
  RoutingCreateMessagePlanPage,
  RoutingEditMessagePlanSettingsPage,
  RoutingGetReadyToMovePage,
  RoutingInvalidMessagePlanPage,
  RoutingMessagePlanCampaignIdRequiredPage,
  RoutingMessagePlansPage,
  RoutingPreviewEmailTemplatePage,
  RoutingPreviewLargePrintLetterTemplatePage,
  RoutingPreviewMessagePlanPage,
  RoutingPreviewNhsAppTemplatePage,
  RoutingPreviewOtherLanguageLetterTemplatePage,
  RoutingPreviewSmsTemplatePage,
  RoutingPreviewStandardLetterTemplatePage,
  RoutingReviewAndMoveToProductionPage,
} from 'pages/routing';
import { RoutingConfigStatus } from 'nhs-notify-backend-client';
import { getTestContext } from 'helpers/context/context';

let userWithMultipleCampaigns: TestUser;
const routingStorageHelper = new RoutingConfigStorageHelper();
const templateStorageHelper = new TemplateStorageHelper();
const draftRoutingConfigId = randomUUID();
const productionRoutingConfigId = randomUUID();
const emptyRoutingConfigId = randomUUID();
const messageOrder = 'NHSAPP,EMAIL,SMS,LETTER';
const templateIds = {
  NHSAPP: randomUUID(),
  SMS: randomUUID(),
  EMAIL: randomUUID(),
  LETTER: randomUUID(),
  LETTER_LARGE_PRINT: randomUUID(),
  LETTER_OTHER_LANGUAGE: randomUUID(),
};

const routingPages = [
  RoutingChooseEmailTemplatePage,
  RoutingChooseLargePrintLetterTemplatePage,
  RoutingChooseMessageOrderPage,
  RoutingChooseNhsAppTemplatePage,
  RoutingChooseOtherLanguageLetterTemplatePage,
  RoutingChooseStandardLetterTemplatePage,
  RoutingChooseTemplatesPage,
  RoutingChooseTextMessageTemplatePage,
  RoutingCreateMessagePlanPage,
  RoutingEditMessagePlanSettingsPage,
  RoutingGetReadyToMovePage,
  RoutingInvalidMessagePlanPage,
  RoutingMessagePlanCampaignIdRequiredPage,
  RoutingMessagePlansPage,
  RoutingPreviewEmailTemplatePage,
  RoutingPreviewLargePrintLetterTemplatePage,
  RoutingPreviewMessagePlanPage,
  RoutingPreviewNhsAppTemplatePage,
  RoutingPreviewOtherLanguageLetterTemplatePage,
  RoutingPreviewSmsTemplatePage,
  RoutingPreviewStandardLetterTemplatePage,
  RoutingReviewAndMoveToProductionPage,
];

test.describe('Routing', () => {
  test.beforeAll(async () => {
    const context = getTestContext();

    const user = await context.auth.getTestUser(testUsers.User1.userId);

    userWithMultipleCampaigns = await context.auth.getTestUser(
      testUsers.UserWithMultipleCampaigns.userId
    );

    const createRoutingConfig = (id: string, status: RoutingConfigStatus) =>
      RoutingConfigFactory.createForMessageOrder(user, messageOrder, {
        id,
        status,
      })
        .addTemplate('NHSAPP', templateIds.NHSAPP)
        .addTemplate('SMS', templateIds.SMS)
        .addTemplate('EMAIL', templateIds.EMAIL)
        .addTemplate('LETTER', templateIds.LETTER)
        .addTemplate('LETTER', templateIds.LETTER_LARGE_PRINT)
        .addTemplate('LETTER', templateIds.LETTER_OTHER_LANGUAGE);

    const draftRoutingConfig = createRoutingConfig(
      draftRoutingConfigId,
      'DRAFT'
    ).dbEntry;

    const productionRoutingConfig = createRoutingConfig(
      productionRoutingConfigId,
      'COMPLETED'
    ).dbEntry;

    const emptyRoutingConfig = RoutingConfigFactory.createForMessageOrder(
      user,
      messageOrder,
      {
        id: emptyRoutingConfigId,
        status: 'DRAFT',
      }
    ).dbEntry;

    await routingStorageHelper.seed([
      draftRoutingConfig,
      emptyRoutingConfig,
      productionRoutingConfig,
    ]);

    await templateStorageHelper.seedTemplateData([
      TemplateFactory.createNhsAppTemplate(
        templateIds.NHSAPP,
        user,
        `Test NHS App template - ${templateIds.NHSAPP}`
      ),
      TemplateFactory.createEmailTemplate(
        templateIds.EMAIL,
        user,
        `Test Email template - ${templateIds.EMAIL}`
      ),
      TemplateFactory.createSmsTemplate(
        templateIds.SMS,
        user,
        `Test SMS template - ${templateIds.SMS}`
      ),
      TemplateFactory.uploadLetterTemplate(
        templateIds.LETTER,
        user,
        `Test Letter template - ${templateIds.LETTER}`
      ),
      TemplateFactory.uploadLetterTemplate(
        templateIds.LETTER_LARGE_PRINT,
        user,
        `Test Large Print Letter template - ${templateIds.LETTER_LARGE_PRINT}`,
        'NOT_YET_SUBMITTED',
        'PASSED',
        { letterType: 'x1' }
      ),
      TemplateFactory.uploadLetterTemplate(
        templateIds.LETTER_OTHER_LANGUAGE,
        user,
        `Test Letter template French - ${templateIds.LETTER_OTHER_LANGUAGE}`,
        'NOT_YET_SUBMITTED',
        'PASSED',
        { language: 'fr' }
      ),
    ]);
  });

  test.afterAll(async () => {
    await routingStorageHelper.deleteSeeded();
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('message plan routes are covered', async () => {
    const routes = await getAppRoutes();

    const messagePlanRoutes = routes.filter((r) =>
      r.startsWith('message-plans')
    );

    const uncoveredMessagePlans = messagePlanRoutes.filter(
      (r) =>
        !routingPages.some(
          ({ staticPathSegments }) => `${staticPathSegments.join('/')}` === r
        )
    );

    expect(uncoveredMessagePlans).toHaveLength(0);
    expect(messagePlanRoutes.length).toBe(routingPages.length);
  });

  test.describe('Choose templates', () => {
    test('Choose large print letter template', async ({ page, analyze }) =>
      analyze(
        new RoutingChooseLargePrintLetterTemplatePage(page)
          .setPathParam('messagePlanId', draftRoutingConfigId)
          .setSearchParam('lockNumber', '0')
      ));

    test('Choose other language letter template', async ({ page, analyze }) =>
      analyze(
        new RoutingChooseOtherLanguageLetterTemplatePage(page)
          .setPathParam('messagePlanId', draftRoutingConfigId)
          .setSearchParam('lockNumber', '0')
      ));

    test('Choose standard letter template', async ({ page, analyze }) =>
      analyze(
        new RoutingChooseStandardLetterTemplatePage(page)
          .setPathParam('messagePlanId', draftRoutingConfigId)
          .setSearchParam('lockNumber', '0')
      ));

    test('Choose email template', async ({ page, analyze }) =>
      analyze(
        new RoutingChooseEmailTemplatePage(page)
          .setPathParam('messagePlanId', draftRoutingConfigId)
          .setSearchParam('lockNumber', '0')
      ));

    test('Choose NHS App template', async ({ page, analyze }) =>
      analyze(
        new RoutingChooseNhsAppTemplatePage(page)
          .setPathParam('messagePlanId', draftRoutingConfigId)
          .setSearchParam('lockNumber', '0')
      ));

    test('Choose text message template', async ({ page, analyze }) =>
      analyze(
        new RoutingChooseTextMessageTemplatePage(page)
          .setPathParam('messagePlanId', draftRoutingConfigId)
          .setSearchParam('lockNumber', '0')
      ));
  });

  test.describe('Preview templates', () => {
    test('Preview large print letter template', async ({ page, analyze }) =>
      analyze(
        new RoutingPreviewLargePrintLetterTemplatePage(page)
          .setPathParam('messagePlanId', draftRoutingConfigId)
          .setPathParam('templateId', templateIds.LETTER_LARGE_PRINT)
          .setSearchParam('lockNumber', '0')
      ));

    test('Preview other language letter template', async ({ page, analyze }) =>
      analyze(
        new RoutingPreviewOtherLanguageLetterTemplatePage(page)
          .setPathParam('messagePlanId', draftRoutingConfigId)
          .setPathParam('templateId', templateIds.LETTER_OTHER_LANGUAGE)
          .setSearchParam('lockNumber', '0')
      ));

    test('Preview standard letter template', async ({ page, analyze }) =>
      analyze(
        new RoutingPreviewStandardLetterTemplatePage(page)
          .setPathParam('messagePlanId', draftRoutingConfigId)
          .setPathParam('templateId', templateIds.LETTER)
          .setSearchParam('lockNumber', '0')
      ));

    test('Preview email template', async ({ page, analyze }) =>
      analyze(
        new RoutingPreviewEmailTemplatePage(page)
          .setPathParam('messagePlanId', draftRoutingConfigId)
          .setPathParam('templateId', templateIds.EMAIL)
          .setSearchParam('lockNumber', '0')
      ));

    test('Preview NHS App template', async ({ page, analyze }) =>
      analyze(
        new RoutingPreviewNhsAppTemplatePage(page)
          .setPathParam('messagePlanId', draftRoutingConfigId)
          .setPathParam('templateId', templateIds.NHSAPP)
          .setSearchParam('lockNumber', '0')
      ));

    test('Preview text message template', async ({ page, analyze }) =>
      analyze(
        new RoutingPreviewSmsTemplatePage(page)
          .setPathParam('messagePlanId', draftRoutingConfigId)
          .setPathParam('templateId', templateIds.SMS)
          .setSearchParam('lockNumber', '0')
      ));
  });

  test('Message plans', async ({ page, analyze }) =>
    analyze(new RoutingMessagePlansPage(page)));

  test('Campaign required', async ({ page, analyze }) =>
    analyze(new RoutingMessagePlanCampaignIdRequiredPage(page)));

  test('Invalid message plans', async ({ page, analyze }) =>
    analyze(new RoutingInvalidMessagePlanPage(page)));

  test('Choose message order', async ({ page, analyze }) =>
    analyze(new RoutingChooseMessageOrderPage(page)));

  test('Choose message order - error', async ({ page, analyze }) =>
    analyze(new RoutingChooseMessageOrderPage(page), {
      beforeAnalyze: (p) => p.clickContinueButton(),
    }));

  test('Choose template', async ({ page, analyze }) =>
    analyze(
      new RoutingChooseTemplatesPage(page).setPathParam(
        'messagePlanId',
        draftRoutingConfigId
      )
    ));

  test('Choose template - error', async ({ page, analyze }) =>
    analyze(
      new RoutingChooseTemplatesPage(page).setPathParam(
        'messagePlanId',
        emptyRoutingConfigId
      ),
      {
        beforeAnalyze: (p) => p.clickMoveToProduction(),
      }
    ));

  test('Preview message plan', async ({ page, analyze }) =>
    analyze(
      new RoutingPreviewMessagePlanPage(page).setPathParam(
        'messagePlanId',
        productionRoutingConfigId
      )
    ));

  test('Edit message plan settings', async ({ page, analyze }) =>
    analyze(
      new RoutingEditMessagePlanSettingsPage(page).setPathParam(
        'messagePlanId',
        draftRoutingConfigId
      )
    ));

  test('Edit message plan settings - error', async ({ page, analyze }) =>
    analyze(
      new RoutingEditMessagePlanSettingsPage(page).setPathParam(
        'messagePlanId',
        draftRoutingConfigId
      ),
      {
        beforeAnalyze: async (p) => {
          await p.nameField.fill('');
          await p.clickSubmit();
        },
      }
    ));

  test('Get ready to move message plan', async ({ page, analyze }) =>
    analyze(
      new RoutingGetReadyToMovePage(page).setPathParam(
        'messagePlanId',
        draftRoutingConfigId
      )
    ));

  test('Review and move to production', async ({ page, analyze }) =>
    analyze(
      new RoutingReviewAndMoveToProductionPage(page)
        .setPathParam('messagePlanId', draftRoutingConfigId)
        .setSearchParam('lockNumber', '0')
    ));

  test.describe('client has multiple campaigns', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      await loginAsUser(userWithMultipleCampaigns, page);
    });

    test('Create message plan', async ({ page, analyze }) =>
      analyze(
        new RoutingCreateMessagePlanPage(page).setSearchParam(
          'messageOrder',
          messageOrder
        )
      ));

    test('Create message plan - error', async ({ page, analyze }) =>
      analyze(
        new RoutingCreateMessagePlanPage(page).setSearchParam(
          'messageOrder',
          messageOrder
        ),
        {
          beforeAnalyze: (p) => p.clickSubmit(),
        }
      ));
  });
});
