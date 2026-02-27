import { expect, test, Locator } from '@playwright/test';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { TemplateFactory } from '../helpers/factories/template-factory';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { randomUUID } from 'node:crypto';
import {
  RoutingChooseMessageOrderPage,
  RoutingChooseTemplatesPage,
  RoutingCreateMessagePlanPage,
  RoutingMessagePlansPage,
  RoutingChooseOtherLanguageLetterTemplatePage,
  RoutingChooseNhsAppTemplatePage,
  RoutingChooseEmailTemplatePage,
  RoutingChooseTextMessageTemplatePage,
  RoutingPreviewSmsTemplatePage,
  RoutingChooseStandardLetterTemplatePage,
  RoutingChooseLargePrintLetterTemplatePage,
  RoutingGetReadyToMovePage,
  RoutingReviewAndMoveToProductionPage,
} from '../pages/routing';
import { TemplateMgmtMessageTemplatesPage } from '../pages/template-mgmt-message-templates-page';
import { RoutingChooseTemplateForMessagePlanBasePage } from '../pages/routing/choose-template-base-page';
import type { Template } from '../helpers/types';
import { loginAsUser } from 'helpers/auth/login-as-user';
import type { Channel } from 'nhs-notify-web-template-management-types';

const templateStorageHelper = new TemplateStorageHelper();

function createTemplates(user: TestUser) {
  const templateIds = {
    NHSAPP: randomUUID(),
    EMAIL: randomUUID(),
    SMS: randomUUID(),
    LETTER: randomUUID(),
    LARGE_PRINT_LETTER: randomUUID(),
    ARABIC_LETTER: randomUUID(),
    POLISH_LETTER: randomUUID(),
  };

  return {
    NHSAPP: TemplateFactory.createNhsAppTemplate(
      templateIds.NHSAPP,
      user,
      `E2E NHS App template - ${templateIds.NHSAPP}`,
      'SUBMITTED'
    ),
    EMAIL: TemplateFactory.createEmailTemplate(
      templateIds.EMAIL,
      user,
      `E2E Email template - ${templateIds.EMAIL}`,
      'NOT_YET_SUBMITTED'
    ),
    SMS: TemplateFactory.createSmsTemplate(
      templateIds.SMS,
      user,
      `E2E SMS template - ${templateIds.SMS}`,
      'NOT_YET_SUBMITTED'
    ),
    LETTER: TemplateFactory.createAuthoringLetterTemplate(
      templateIds.LETTER,
      user,
      `E2E Letter template - ${templateIds.LETTER}`,
      'PROOF_APPROVED'
    ),
    LARGE_PRINT_LETTER: TemplateFactory.createAuthoringLetterTemplate(
      templateIds.LARGE_PRINT_LETTER,
      user,
      `E2E Large Print Letter template - ${templateIds.LARGE_PRINT_LETTER}`,
      'PROOF_APPROVED',
      { letterType: 'x1' }
    ),
    ARABIC_LETTER: TemplateFactory.createAuthoringLetterTemplate(
      templateIds.ARABIC_LETTER,
      user,
      `E2E Letter template Arabic - ${templateIds.ARABIC_LETTER}`,
      'PROOF_APPROVED',
      { language: 'ar' }
    ),
    POLISH_LETTER: TemplateFactory.createAuthoringLetterTemplate(
      templateIds.POLISH_LETTER,
      user,
      `E2E Polish Letter template - ${templateIds.POLISH_LETTER}`,
      'SUBMITTED',
      { language: 'pl' }
    ),
  };
}

async function selectTemplateRadio(
  chooseTemplateLink: Locator,
  chooseTemplatePage: RoutingChooseTemplateForMessagePlanBasePage,
  template: Template,
  templateNameLocator: Locator
) {
  return test.step(`select template: ${template.name}`, async () => {
    await chooseTemplateLink.click();

    const radio = chooseTemplatePage.getRadioButton(template.id);

    await radio.click();

    await chooseTemplatePage.saveAndContinueButton.click();

    await expect(templateNameLocator).toHaveText(template.name);
  });
}

async function assertTemplateStatuses(
  messageTemplatesPage: TemplateMgmtMessageTemplatesPage,
  expectations: Array<{ template: Template; expectedStatus: string }>
) {
  return test.step('assert template statuses', async () => {
    for (const { template, expectedStatus } of expectations) {
      expect(
        await messageTemplatesPage.getTemplateStatus(template.id),
        `Expected ${template.name} to have status "${expectedStatus}"`
      ).toBe(expectedStatus);
    }
  });
}

async function assertMessagePlanInTable(
  table: Locator,
  messagePlanName: string
) {
  return test.step(`assert message plan "${messagePlanName}" is in table`, async () => {
    await table.click();

    const row = table.getByRole('row', { name: messagePlanName });

    await expect(row).toBeVisible();

    await row.getByRole('link', { name: messagePlanName }).click();
  });
}

test.describe('Routing', () => {
  let templates: ReturnType<typeof createTemplates>;
  let user: TestUser;

  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeAll(async () => {
    user = await createAuthHelper().getTestUser(
      testUsers.UserLetterAuthoringEnabled.userId
    );
    templates = createTemplates(user);

    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.beforeEach(async ({ page }) => {
    await loginAsUser(user, page);
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('templates are added to the routing config, and the routing config is completed', async ({
    page,
  }) => {
    const rcName = 'E2E TEST RC';

    const messageTemplatesPage = new TemplateMgmtMessageTemplatesPage(page);
    const messagePlansPage = new RoutingMessagePlansPage(page);
    const chooseTemplatesPage = new RoutingChooseTemplatesPage(page);

    await test.step('check initial template statuses', async () => {
      await messageTemplatesPage.loadPage();

      await expect(messageTemplatesPage.pageHeading).toBeVisible();

      await assertTemplateStatuses(messageTemplatesPage, [
        { template: templates.NHSAPP, expectedStatus: 'Locked' },
        { template: templates.POLISH_LETTER, expectedStatus: 'Locked' },
        { template: templates.EMAIL, expectedStatus: 'Draft' },
        { template: templates.SMS, expectedStatus: 'Draft' },
        { template: templates.LETTER, expectedStatus: 'Proof approved' },
        {
          template: templates.LARGE_PRINT_LETTER,
          expectedStatus: 'Proof approved',
        },
        { template: templates.ARABIC_LETTER, expectedStatus: 'Proof approved' },
      ]);
    });

    await test.step('create routing config', async () => {
      await messageTemplatesPage.clickMessagePlansHeaderLink();

      await expect(messagePlansPage.pageHeading).toBeVisible();

      await messagePlansPage.clickNewMessagePlanButton();

      const chooseMessageOrderPage = new RoutingChooseMessageOrderPage(page);

      await chooseMessageOrderPage.checkRadioButton('NHSAPP,EMAIL,SMS,LETTER');

      await chooseMessageOrderPage.clickContinueButton();

      const createMessagePlanPage = new RoutingCreateMessagePlanPage(page);

      await createMessagePlanPage.nameField.fill(rcName);

      await createMessagePlanPage.clickSubmit();
    });

    await test.step('add other language letter templates', async () => {
      await chooseTemplatesPage.letter.language.chooseTemplateLink.click();

      const chooseOtherLanguageTemplatesPage =
        new RoutingChooseOtherLanguageLetterTemplatePage(page);

      await expect(
        chooseOtherLanguageTemplatesPage.tableRows.filter({
          hasText: templates.ARABIC_LETTER.name,
        })
      ).toBeVisible();

      await expect(
        chooseOtherLanguageTemplatesPage.tableRows.filter({
          hasText: templates.POLISH_LETTER.name,
        })
      ).toBeVisible();

      await expect(
        chooseOtherLanguageTemplatesPage.tableRows.filter({
          hasText: templates.LETTER.name,
        })
      ).toBeHidden();

      const plCheck = await chooseOtherLanguageTemplatesPage.getCheckbox(
        templates.POLISH_LETTER.id
      );

      const arCheck = await chooseOtherLanguageTemplatesPage.getCheckbox(
        templates.ARABIC_LETTER.id
      );

      await arCheck.click();
      await plCheck.click();

      await chooseOtherLanguageTemplatesPage.saveAndContinueButton.click();

      const otherLanguageNames =
        chooseTemplatesPage.letter.language.templateNames;

      await expect(otherLanguageNames).toHaveCount(2);

      await expect(
        otherLanguageNames.filter({
          hasText: templates.ARABIC_LETTER.name,
        })
      ).toBeVisible();

      await expect(
        otherLanguageNames.filter({
          hasText: templates.POLISH_LETTER.name,
        })
      ).toBeVisible();
    });

    await test.step('check draft message plan exists', async () => {
      await chooseTemplatesPage.clickMessagePlansHeaderLink();

      await expect(messagePlansPage.pageHeading).toBeVisible();

      await assertMessagePlanInTable(
        messagePlansPage.draftMessagePlansTable,
        rcName
      );
    });

    await test.step('add NHS App template', async () => {
      await selectTemplateRadio(
        chooseTemplatesPage.nhsApp.chooseTemplateLink,
        new RoutingChooseNhsAppTemplatePage(page),
        templates.NHSAPP,
        chooseTemplatesPage.nhsApp.templateName
      );
    });

    await test.step('add Email template', async () => {
      await selectTemplateRadio(
        chooseTemplatesPage.email.chooseTemplateLink,
        new RoutingChooseEmailTemplatePage(page),
        templates.EMAIL,
        chooseTemplatesPage.email.templateName
      );
    });

    await test.step('preview and add SMS template', async () => {
      await chooseTemplatesPage.sms.chooseTemplateLink.click();

      const chooseSmsTemplatePage = new RoutingChooseTextMessageTemplatePage(
        page
      );

      const smsPreviewLink = chooseSmsTemplatePage.getPreviewLink(
        templates.SMS.id
      );

      await smsPreviewLink.click();

      const previewSmsTemplatePage = new RoutingPreviewSmsTemplatePage(page);

      await expect(previewSmsTemplatePage.templateId).toHaveText(
        templates.SMS.id
      );

      await previewSmsTemplatePage.clickBackLinkTop();

      const smsRadio = chooseSmsTemplatePage.getRadioButton(templates.SMS.id);

      await smsRadio.click();

      await chooseSmsTemplatePage.saveAndContinueButton.click();

      await expect(chooseTemplatesPage.sms.templateName).toHaveText(
        templates.SMS.name
      );
    });

    await test.step('verify validation error for missing letter template', async () => {
      await chooseTemplatesPage.clickMoveToProduction();

      await expect(chooseTemplatesPage.errorSummaryList).toContainText([
        'You have not chosen a template for your fourth message',
      ]);
    });

    await test.step('add standard letter template', async () => {
      await selectTemplateRadio(
        chooseTemplatesPage.letter.standard.chooseTemplateLink,
        new RoutingChooseStandardLetterTemplatePage(page),
        templates.LETTER,
        chooseTemplatesPage.letter.standard.templateName
      );
    });

    await test.step('add large print letter template', async () => {
      await selectTemplateRadio(
        chooseTemplatesPage.letter.largePrint.chooseTemplateLink,
        new RoutingChooseLargePrintLetterTemplatePage(page),
        templates.LARGE_PRINT_LETTER,
        chooseTemplatesPage.letter.largePrint.templateName
      );
    });

    await test.step('remove large print letter template', async () => {
      await chooseTemplatesPage.letter.largePrint.removeTemplateLink.click();

      await expect(
        chooseTemplatesPage.letter.largePrint.chooseTemplateLink
      ).toBeVisible();
    });

    await test.step('review and move to production', async () => {
      await chooseTemplatesPage.clickMoveToProduction();

      const getReadyToMovePage = new RoutingGetReadyToMovePage(page);

      await expect(getReadyToMovePage.pageHeading).toBeVisible();

      await getReadyToMovePage.continueLink.click();

      const reviewPage = new RoutingReviewAndMoveToProductionPage(page);

      await expect(reviewPage.pageHeading).toBeVisible();

      const defaults: [Channel, Template][] = [
        ['NHSAPP', templates.NHSAPP],
        ['EMAIL', templates.EMAIL],
        ['SMS', templates.SMS],
        ['LETTER', templates.LETTER],
      ];

      for (const [channel, defaultTemplate] of defaults) {
        await expect(
          reviewPage.getTemplateBlock(channel).defaultTemplateCard.templateName
        ).toHaveText(defaultTemplate.name);
      }

      const letterBlock = reviewPage.getTemplateBlock('LETTER');

      // this template was removed
      await expect(
        letterBlock.getAccessibilityFormatCard('x1').locator
      ).toBeHidden();

      const languageTemplateNames = await letterBlock
        .getLanguagesCard()
        .templateName.allTextContents();

      expect(languageTemplateNames).toHaveLength(2);
      expect(languageTemplateNames).toContain(templates.ARABIC_LETTER.name);
      expect(languageTemplateNames).toContain(templates.POLISH_LETTER.name);

      await reviewPage.moveToProductionButton.click();
    });

    await test.step('verify message plan is in production', async () => {
      // eslint-disable-next-line security/detect-non-literal-regexp
      await expect(page).toHaveURL(new RegExp(`${messagePlansPage.getUrl()}$`));
      await expect(messagePlansPage.pageHeading).toBeVisible();

      await assertMessagePlanInTable(
        messagePlansPage.productionMessagePlansTable,
        rcName
      );
    });

    await test.step('verify all templates are locked (except removed large print letter)', async () => {
      await messagePlansPage.clickTemplatesHeaderLink();

      await expect(messageTemplatesPage.pageHeading).toBeVisible();

      await assertTemplateStatuses(messageTemplatesPage, [
        { template: templates.NHSAPP, expectedStatus: 'Locked' },
        { template: templates.EMAIL, expectedStatus: 'Locked' },
        { template: templates.SMS, expectedStatus: 'Locked' },
        { template: templates.LETTER, expectedStatus: 'Locked' },
        { template: templates.ARABIC_LETTER, expectedStatus: 'Locked' },
        { template: templates.POLISH_LETTER, expectedStatus: 'Locked' },
        {
          template: templates.LARGE_PRINT_LETTER,
          // this was removed before going to production
          expectedStatus: 'Proof approved',
        },
      ]);
    });
  });
});
