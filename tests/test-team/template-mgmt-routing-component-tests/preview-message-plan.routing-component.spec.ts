import { randomUUID } from 'node:crypto';
import type { Channel } from 'nhs-notify-web-template-management-types';
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
  assertAndClickBackLinkTop,
  assertAndClickBackLinkBottom,
} from 'helpers/template-mgmt-common.steps';
import { RoutingPreviewMessagePlanPage } from 'pages/routing/preview-message-plan-page';
import { RoutingEditMessagePlanPage } from 'pages/routing';

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
    await assertAndClickBackLinkTop(props);
    await assertAndClickBackLinkBottom(props);
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

  test('redirects to the edit message plan page when message plan is in draft', async ({
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
      `${baseURL}/templates/message-plans/edit-message-plan/${dbEntry.id}`
    );

    const editMessagePlanPage = new RoutingEditMessagePlanPage(page);

    await expect(editMessagePlanPage.messagePlanStatus).toHaveText('Draft');
  });

  test('displays preview of full routing config', async ({ page }) => {
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

    await test.step('shows message plan details', async () => {
      await expect(previewMessagePlanPage.pageHeading).toHaveText(dbEntry.name);
      await expect(previewMessagePlanPage.messagePlanId).toHaveText(dbEntry.id);
      await expect(previewMessagePlanPage.campaignId).toHaveText(
        dbEntry.campaignId
      );
      await expect(previewMessagePlanPage.status).toHaveText('Production');
    });

    await test.step('opens and closes all details sections', async () => {
      for (const section of await previewMessagePlanPage.detailsSections.all()) {
        await expect(section).not.toHaveAttribute('open');
      }

      await expect(previewMessagePlanPage.previewToggleButton).toHaveText(
        'Open all template previews'
      );

      await previewMessagePlanPage.previewToggleButton.click();

      for (const section of await previewMessagePlanPage.detailsSections.all()) {
        await expect(section).toHaveAttribute('open');
      }

      await expect(previewMessagePlanPage.previewToggleButton).toHaveText(
        'Close all template previews'
      );

      await previewMessagePlanPage.previewToggleButton.click();

      for (const section of await previewMessagePlanPage.detailsSections.all()) {
        await expect(section).not.toHaveAttribute('open');
      }

      await expect(previewMessagePlanPage.previewToggleButton).toHaveText(
        'Open all template previews'
      );
    });

    for (const [index, channel] of (
      ['NHSAPP', 'EMAIL', 'SMS'] satisfies Channel[]
    ).entries()) {
      await test.step(`renders ${channel} template preview and fallback blocks`, async () => {
        const templateBlock =
          await previewMessagePlanPage.getTemplateBlock(channel);

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

        await expect(
          previewMessagePlanPage.getFallbackBlock(channel)
        ).toBeVisible();
      });
    }

    await test.step('for LETTER channel renders template links for default and accessible templates along with conditional template fallback conditions', async () => {
      const templateBlock =
        await previewMessagePlanPage.getTemplateBlock('LETTER');

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

      for (const [index, language] of (
        ['FRENCH_LETTER', 'SPANISH_LETTER'] satisfies (keyof ReturnType<
          typeof createTemplates
        >)[]
      ).entries()) {
        const links = await templateBlock.getLanguagesCard().templateLink.all();
        await expect(links[index]).toHaveText(templates[language].name);

        await expect(links[index]).toHaveAttribute(
          'href',
          `/templates/preview-submitted-letter-template/${templates[language].id}`
        );
      }

      await templateBlock.defaultTemplateCard.templateLink.click();

      await expect(page).toHaveURL(
        `/templates/preview-submitted-letter-template/${templates.LETTER.id}`
      );
    });
  });

  test('letter only with no conditional templates', async ({ page }) => {
    const { dbEntry } = RoutingConfigFactory.createWithChannels(
      user,
      ['LETTER'],
      { status: 'COMPLETED' }
    ).addTemplate('LETTER', templates.LETTER.id);

    await routingConfigStorageHelper.seed([dbEntry]);

    const previewMessagePlanPage = new RoutingPreviewMessagePlanPage(
      page
    ).setPathParam('messagePlanId', dbEntry.id);

    await previewMessagePlanPage.loadPage();

    await test.step('does not render the open/close preview button', async () => {
      await expect(previewMessagePlanPage.previewToggleButton).toBeHidden();
    });

    await test.step('does not render sections for conditional templates', async () => {
      const templateBlock =
        await previewMessagePlanPage.getTemplateBlock('LETTER');

      await expect(
        templateBlock.getAccessibilityFormatCard('x1').locator
      ).toBeHidden();

      await expect(templateBlock.getLanguagesCard().locator).toBeHidden();
    });
  });
});
