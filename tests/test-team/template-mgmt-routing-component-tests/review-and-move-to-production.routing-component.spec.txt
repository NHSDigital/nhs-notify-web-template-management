import { randomUUID } from 'node:crypto';
import { Channel } from 'nhs-notify-backend-client';
import { test, expect } from '@playwright/test';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from 'helpers/auth/cognito-auth-helper';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import { TemplateFactory } from 'helpers/factories/template-factory';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
} from 'helpers/template-mgmt-common.steps';
import { RoutingReviewAndMoveToProductionPage } from 'pages/routing/review-and-move-to-production-page';
import { RoutingChooseTemplatesPage } from 'pages/routing';
import { RoutingMessagePlansPage } from 'pages/routing/message-plans-page';

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
      `Test NHS App template - ${templateIds.NHSAPP}`,
      'SUBMITTED'
    ),
    EMAIL: TemplateFactory.createEmailTemplate(
      templateIds.EMAIL,
      user,
      `Test Email template - ${templateIds.EMAIL}`,
      'SUBMITTED'
    ),
    SMS: TemplateFactory.createSmsTemplate(
      templateIds.SMS,
      user,
      `Test SMS template - ${templateIds.SMS}`,
      'SUBMITTED'
    ),
    LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.LETTER,
      user,
      `Test Letter template - ${templateIds.LETTER}`,
      'SUBMITTED'
    ),
    LARGE_PRINT_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.LARGE_PRINT_LETTER,
      user,
      `Test Large Print Letter template - ${templateIds.LARGE_PRINT_LETTER}`,
      'SUBMITTED',
      'PASSED',
      { letterType: 'x1' }
    ),
    FRENCH_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.FRENCH_LETTER,
      user,
      `Test Letter template French - ${templateIds.FRENCH_LETTER}`,
      'SUBMITTED',
      'PASSED',
      { language: 'fr' }
    ),
    SPANISH_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.SPANISH_LETTER,
      user,
      `Test Spanish Letter template - ${templateIds.SPANISH_LETTER}`,
      'SUBMITTED',
      'PASSED',
      { language: 'es' }
    ),
  };
}

test.describe('Routing - Review and Move to Production page', () => {
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
      { status: 'DRAFT' }
    ).addTemplate('NHSAPP', templates.NHSAPP.id);

    await routingConfigStorageHelper.seed([dbEntry]);

    const props = {
      page: new RoutingReviewAndMoveToProductionPage(page).setPathParam(
        'messagePlanId',
        dbEntry.id
      ),
      baseURL,
    };

    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
  });

  test('redirects to invalid message plan page when message plan cannot be found', async ({
    page,
    baseURL,
  }) => {
    const reviewPage = new RoutingReviewAndMoveToProductionPage(
      page
    ).setPathParam('messagePlanId', 'does-not-exist');

    await reviewPage.loadPage();

    await expect(page).toHaveURL(`${baseURL}/templates/message-plans/invalid`);
  });

  test('redirects to preview message plan page when message plan is not DRAFT', async ({
    page,
    baseURL,
  }) => {
    const { dbEntry } = RoutingConfigFactory.createWithChannels(
      user,
      ['NHSAPP'],
      { status: 'COMPLETED' }
    ).addTemplate('NHSAPP', templates.NHSAPP.id);

    await routingConfigStorageHelper.seed([dbEntry]);

    const reviewPage = new RoutingReviewAndMoveToProductionPage(
      page
    ).setPathParam('messagePlanId', dbEntry.id);

    await reviewPage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/preview-message-plan/${dbEntry.id}`
    );
  });

  test('displays message plan name in summary list', async ({ page }) => {
    const { dbEntry } = RoutingConfigFactory.createWithChannels(
      user,
      ['NHSAPP'],
      { status: 'DRAFT' }
    ).addTemplate('NHSAPP', templates.NHSAPP.id);

    await routingConfigStorageHelper.seed([dbEntry]);

    const reviewPage = new RoutingReviewAndMoveToProductionPage(
      page
    ).setPathParam('messagePlanId', dbEntry.id);

    await reviewPage.loadPage();

    await expect(reviewPage.messagePlanName).toHaveText(dbEntry.name);
  });

  test('displays preview of full routing config', async ({ page }) => {
    const { dbEntry } = RoutingConfigFactory.createWithChannels(
      user,
      ['NHSAPP', 'EMAIL', 'SMS', 'LETTER'],
      { status: 'DRAFT' }
    )
      .addTemplate('NHSAPP', templates.NHSAPP.id)
      .addTemplate('EMAIL', templates.EMAIL.id)
      .addTemplate('SMS', templates.SMS.id)
      .addTemplate('LETTER', templates.LETTER.id)
      .addAccessibleFormatTemplate('x1', templates.LARGE_PRINT_LETTER.id)
      .addLanguageTemplate('fr', templates.FRENCH_LETTER.id)
      .addLanguageTemplate('es', templates.SPANISH_LETTER.id);

    await routingConfigStorageHelper.seed([dbEntry]);

    const reviewPage = new RoutingReviewAndMoveToProductionPage(
      page
    ).setPathParam('messagePlanId', dbEntry.id);

    await reviewPage.loadPage();

    await test.step('opens and closes all details sections', async () => {
      for (const section of await reviewPage.detailsSections.all()) {
        await expect(section).not.toHaveAttribute('open');
      }

      await expect(reviewPage.previewToggleButton).toHaveText(
        'Open all template previews'
      );

      await reviewPage.previewToggleButton.click();

      for (const section of await reviewPage.detailsSections.all()) {
        await expect(section).toHaveAttribute('open');
      }

      await expect(reviewPage.previewToggleButton).toHaveText(
        'Close all template previews'
      );

      await reviewPage.previewToggleButton.click();

      for (const section of await reviewPage.detailsSections.all()) {
        await expect(section).not.toHaveAttribute('open');
      }

      await expect(reviewPage.previewToggleButton).toHaveText(
        'Open all template previews'
      );
    });

    for (const [index, channel] of (
      ['NHSAPP', 'EMAIL', 'SMS'] satisfies Channel[]
    ).entries()) {
      await test.step(`renders ${channel} template preview and fallback blocks`, async () => {
        const templateBlock = await reviewPage.getTemplateBlock(channel);

        await expect(templateBlock.number).toHaveText(`${index + 1}`);
        await expect(templateBlock.defaultTemplateCard.templateName).toHaveText(
          templates[channel].name
        );

        await expect(
          templateBlock.defaultTemplateCard.previewTemplateText
        ).toBeHidden();

        await templateBlock.defaultTemplateCard.previewTemplateSummary.click();

        await expect(
          templateBlock.defaultTemplateCard.previewTemplateText
        ).toBeVisible();

        await expect(
          templateBlock.defaultTemplateCard.previewTemplateText
        ).toHaveText(templates[channel].message as string);

        await expect(reviewPage.getFallbackBlock(channel)).toBeVisible();
      });
    }

    await test.step('for LETTER channel renders template links for default and accessible templates along with conditional template fallback conditions', async () => {
      const templateBlock = await reviewPage.getTemplateBlock('LETTER');

      await expect(templateBlock.number).toHaveText('4');

      await expect(
        templateBlock.defaultTemplateCard.previewTemplateSummary
      ).toBeHidden();

      await expect(templateBlock.defaultTemplateCard.templateLink).toHaveText(
        templates.LETTER.name
      );
      await expect(
        templateBlock.defaultTemplateCard.templateLink
      ).toHaveAttribute(
        'href',
        `/templates/preview-submitted-letter-template/${templates.LETTER.id}`
      );

      await expect(
        templateBlock.getAccessibilityFormatCard('x1').templateLink
      ).toHaveText(templates.LARGE_PRINT_LETTER.name);

      await expect(
        templateBlock.getAccessibilityFormatCard('x1').templateLink
      ).toHaveAttribute(
        'href',
        `/templates/preview-submitted-letter-template/${templates.LARGE_PRINT_LETTER.id}`
      );

      const languagesCard = templateBlock.getLanguagesCard();
      const languageNames = await languagesCard.templateName.all();
      const languageLinks = await languagesCard.templateLink.all();

      for (const [index, language] of (
        ['FRENCH_LETTER', 'SPANISH_LETTER'] satisfies (keyof ReturnType<
          typeof createTemplates
        >)[]
      ).entries()) {
        await expect(languageNames[index]).toHaveText(templates[language].name);

        await expect(languageLinks[index]).toHaveAttribute(
          'href',
          `/templates/preview-submitted-letter-template/${templates[language].id}`
        );
      }
    });
  });

  test('keep in draft button navigates to choose templates page', async ({
    page,
    baseURL,
  }) => {
    const { dbEntry } = RoutingConfigFactory.createWithChannels(
      user,
      ['NHSAPP'],
      { status: 'DRAFT' }
    ).addTemplate('NHSAPP', templates.NHSAPP.id);

    await routingConfigStorageHelper.seed([dbEntry]);

    const reviewPage = new RoutingReviewAndMoveToProductionPage(
      page
    ).setPathParam('messagePlanId', dbEntry.id);

    await reviewPage.loadPage();

    await reviewPage.keepInDraftButton.click();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-templates/${dbEntry.id}`
    );

    const chooseTemplatesPage = new RoutingChooseTemplatesPage(page);

    await expect(chooseTemplatesPage.messagePlanStatus).toHaveText('Draft');
  });

  test('move to production button submits plan and navigates to message plans page', async ({
    page,
    baseURL,
  }) => {
    const { dbEntry } = RoutingConfigFactory.createWithChannels(
      user,
      ['NHSAPP'],
      { status: 'DRAFT' }
    ).addTemplate('NHSAPP', templates.NHSAPP.id);

    await routingConfigStorageHelper.seed([dbEntry]);

    const reviewPage = new RoutingReviewAndMoveToProductionPage(
      page
    ).setPathParam('messagePlanId', dbEntry.id);

    await reviewPage.loadPage();

    await reviewPage.moveToProductionButton.click();

    await expect(page).toHaveURL(`${baseURL}/templates/message-plans`);

    const messagePlansPage = new RoutingMessagePlansPage(page);

    // Verify the plan now appears in the production section
    const productionIdCells =
      messagePlansPage.productionMessagePlansTable.getByTestId(
        'message-plan-id-cell'
      );

    const productionCellsText = await productionIdCells.allTextContents();

    expect(productionCellsText).toContainEqual(
      expect.stringContaining(dbEntry.id)
    );
  });
});
