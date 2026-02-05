/* eslint-disable security/detect-non-literal-regexp */
import { expect, test } from '@playwright/test';
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
} from '../pages/routing';

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
      'SUBMITTED'
    ),
    SMS: TemplateFactory.createSmsTemplate(
      templateIds.SMS,
      user,
      `E2E SMS template - ${templateIds.SMS}`,
      'SUBMITTED'
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
      'SUBMITTED',
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

test.describe('Routing', () => {
  let templates: ReturnType<typeof createTemplates>;
  let user: TestUser;

  test.beforeAll(async () => {
    user = await createAuthHelper().getTestUser(testUsers.User1.userId);
    templates = createTemplates(user);

    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('templates are added to the routing config, and the routing config is completed', async ({
    page,
  }) => {
    const rcName = 'E2E test RC';

    const messagePlansPage = new RoutingMessagePlansPage(page);

    await messagePlansPage.loadPage();

    await messagePlansPage.clickNewMessagePlanButton();

    const chooseMessageOrderPage = new RoutingChooseMessageOrderPage(page);

    await chooseMessageOrderPage.checkRadioButton(
      'NHS App, Email, Text message, Letter'
    );

    await chooseMessageOrderPage.clickContinueButton();

    const createMessagePlanPage = new RoutingCreateMessagePlanPage(page);

    await createMessagePlanPage.nameField.fill(rcName);

    await createMessagePlanPage.clickSubmit();

    const chooseTemplatesPage = new RoutingChooseTemplatesPage(page);

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

    await chooseTemplatesPage.nhsApp.chooseTemplateLink.click();

    const chooseNhsAppTemplatePage = new RoutingChooseNhsAppTemplatePage(page);

    const nhsAppRadio = chooseNhsAppTemplatePage.getRadioButton(
      templates.NHSAPP.id
    );

    await nhsAppRadio.click();

    await chooseNhsAppTemplatePage.saveAndContinueButton.click();

    await expect(chooseTemplatesPage.nhsApp.templateName).toHaveText(
      templates.NHSAPP.name
    );

    await chooseTemplatesPage.clickMoveToProduction();

    await expect(chooseTemplatesPage.errorSummary).toContainText([
      'There is a problem',
      'You must choose a template for each message',
      'You have not chosen a template for your second message',
      'You have not chosen a template for your third message',
      'You have not chosen a template for your fourth message',
    ]);
  });
});
