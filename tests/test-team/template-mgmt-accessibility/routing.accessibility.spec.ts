import {
  createAuthHelper,
  TestUser,
  testUsers,
} from 'helpers/auth/cognito-auth-helper';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import { test } from 'fixtures/accessibility-analyze';
import {
  RoutingChooseMessageOrderPage,
  RoutingCreateMessagePlanPage,
  RoutingChooseTemplatesPage,
  RoutingInvalidMessagePlanPage,
  RoutingMessagePlanCampaignIdRequiredPage,
  RoutingMessagePlansPage,
  RoutingChooseLargePrintLetterTemplatePage,
  RoutingChooseOtherLanguageLetterTemplatePage,
  RoutingChooseStandardLetterTemplatePage,
  RoutingPreviewLargePrintLetterTemplatePage,
  RoutingPreviewOtherLanguageLetterTemplatePage,
  RoutingPreviewStandardLetterTemplatePage,
  RoutingChooseEmailTemplatePage,
  RoutingPreviewEmailTemplatePage,
  RoutingChooseNhsAppTemplatePage,
  RoutingPreviewNhsAppTemplatePage,
  RoutingChooseTextMessageTemplatePage,
  RoutingPreviewSmsTemplatePage,
} from 'pages/routing';
import { loginAsUser } from 'helpers/auth/login-as-user';
import { randomUUID } from 'node:crypto';
import { TemplateFactory } from 'helpers/factories/template-factory';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';
import { RoutingPreviewMessagePlanPage } from 'pages/routing/preview-message-plan-page';
import { RoutingEditMessagePlanSettingsPage } from 'pages/routing/edit-message-plan-settings-page';
import { RoutingGetReadyToMovePage } from 'pages/routing/get-ready-to-move-page';

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

test.describe('Routing', () => {
  test.beforeAll(async () => {
    const authHelper = createAuthHelper();

    const user = await authHelper.getTestUser(testUsers.User1.userId);

    userWithMultipleCampaigns = await authHelper.getTestUser(
      testUsers.UserWithMultipleCampaigns.userId
    );

    const createRoutingConfig = (id: string, status: string) =>
      RoutingConfigFactory.createForMessageOrder(user, messageOrder, {
        id,
        name: `${status} - Test plan with some templates`,
        status,
      })
        .addTemplate('NHSAPP', templateIds.NHSAPP)
        .addTemplate('SMS', templateIds.SMS)
        .addTemplate('EMAIL', templateIds.EMAIL)
        .addTemplate('LETTER', templateIds.LETTER)
        .addTemplate('LETTER', templateIds.LETTER_LARGE_PRINT)
        .addTemplate('LETTER', templateIds.LETTER_OTHER_LANGUAGE);

    const routingConfigDraft = createRoutingConfig(
      draftRoutingConfigId,
      'DRAFT'
    ).dbEntry;

    const routingConfigProduction = createRoutingConfig(
      productionRoutingConfigId,
      'COMPLETED'
    ).dbEntry;

    const templates = [
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
    ];

    await routingStorageHelper.seed([
      routingConfigDraft,
      routingConfigProduction,
      RoutingConfigFactory.createForMessageOrder(user, messageOrder, {
        id: emptyRoutingConfigId,
        name: `EMPTY - Test plan with some templates`,
      }).dbEntry,
    ]);
    await templateStorageHelper.seedTemplateData(templates);
  });

  test.afterAll(async () => {
    await routingStorageHelper.deleteSeeded();
    await templateStorageHelper.deleteSeededTemplates();
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
