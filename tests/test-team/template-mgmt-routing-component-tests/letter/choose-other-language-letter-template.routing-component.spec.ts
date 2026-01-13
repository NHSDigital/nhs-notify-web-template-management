import { test, expect } from '@playwright/test';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertBackLinkBottom,
} from '../../helpers/template-mgmt-common.steps';
import {
  assertChooseTemplatePageWithTemplatesAvailable,
  assertChooseTemplatePageWithNoTemplates,
} from '../routing-common.steps';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from 'helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';
import { randomUUID } from 'node:crypto';
import { TemplateFactory } from 'helpers/factories/template-factory';
import { RoutingChooseOtherLanguageLetterTemplatePage } from 'pages/routing/letter/choose-other-language-letter-template-page';
import { RoutingConfigDbEntry, Template } from 'helpers/types';
import { Language } from 'nhs-notify-backend-client';
import { loginAsUser } from 'helpers/auth/login-as-user';
import { RoutingChooseTemplatesPage } from 'pages/routing';

const routingConfigStorageHelper = new RoutingConfigStorageHelper();
const templateStorageHelper = new TemplateStorageHelper();

const languageTemplatesToDisplay = {
  FRENCH_LETTER: randomUUID(),
  FRENCH_LETTER_APPROVED: randomUUID(),
  POLISH_LETTER: randomUUID(),
  SPANISH_LETTER: randomUUID(),
};

const languageTemplates = {
  ...languageTemplatesToDisplay,
  FRENCH_LETTER_NOT_SUBMITTED: randomUUID(),
};

const templateIds = {
  NHSAPP: randomUUID(),
  LETTER: randomUUID(),
  LARGE_PRINT_LETTER: randomUUID(),
  ...languageTemplates,
};

const routingConfigIds = {
  valid: randomUUID(),
  withAccessibleTemplateSelected: randomUUID(),
  withLanguageTemplatesSelected: randomUUID(),
  validationError: randomUUID(),
  forUserWithNoTemplates: randomUUID(),
  nonLetter: randomUUID(),
  invalid: 'invalid-id',
  notFound: randomUUID(),
};

function getTemplates(
  user: TestUser
): Record<keyof typeof templateIds, Template> {
  return {
    NHSAPP: TemplateFactory.createNhsAppTemplate(
      templateIds.NHSAPP,
      user,
      'Test NHS App template'
    ),
    LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.LETTER,
      user,
      'Test Letter template',
      'SUBMITTED',
      'PASSED'
    ),
    LARGE_PRINT_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.LARGE_PRINT_LETTER,
      user,
      'Test Large Print Letter template',
      'SUBMITTED',
      'PASSED',
      { letterType: 'x1' }
    ),
    FRENCH_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.FRENCH_LETTER,
      user,
      'Test French Letter template',
      'SUBMITTED',
      'PASSED',
      { language: 'fr' }
    ),
    FRENCH_LETTER_APPROVED: TemplateFactory.uploadLetterTemplate(
      templateIds.FRENCH_LETTER_APPROVED,
      user,
      'Test Duplicate French Letter template',
      'PROOF_APPROVED',
      'PASSED',
      { language: 'fr' }
    ),
    FRENCH_LETTER_NOT_SUBMITTED: TemplateFactory.uploadLetterTemplate(
      templateIds.FRENCH_LETTER_NOT_SUBMITTED,
      user,
      'Proof available French letter',
      'PROOF_AVAILABLE',
      'PASSED',
      { language: 'fr' }
    ),
    SPANISH_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.SPANISH_LETTER,
      user,
      'Test Spanish Letter template',
      'SUBMITTED',
      'PASSED',
      { language: 'es' }
    ),
    POLISH_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.POLISH_LETTER,
      user,
      'Test Polish Letter template',
      'SUBMITTED',
      'PASSED',
      { language: 'pl' }
    ),
  };
}

function getRoutingConfigs(
  user: TestUser
): Record<
  Exclude<
    keyof typeof routingConfigIds,
    'forUserWithNoTemplates' | 'invalid' | 'notFound'
  >,
  RoutingConfigDbEntry
> {
  return {
    valid: RoutingConfigFactory.createForMessageOrder(
      user,
      'NHSAPP,EMAIL,SMS,LETTER',
      {
        id: routingConfigIds.valid,
        name: 'Test message plan with no templates selected',
      }
    ).dbEntry,
    withAccessibleTemplateSelected: RoutingConfigFactory.createForMessageOrder(
      user,
      'LETTER',
      {
        id: routingConfigIds.withAccessibleTemplateSelected,
        name: 'Message plan with accessible template selected',
      }
    ).addAccessibleFormatTemplate('x1', templateIds.LARGE_PRINT_LETTER).dbEntry,
    withLanguageTemplatesSelected: RoutingConfigFactory.createForMessageOrder(
      user,
      'LETTER',
      {
        id: routingConfigIds.withLanguageTemplatesSelected,
        name: 'Message plan with language templates selected',
      }
    )
      .addLanguageTemplate('fr', templateIds.FRENCH_LETTER)
      .addLanguageTemplate('pl', templateIds.POLISH_LETTER).dbEntry,
    validationError: RoutingConfigFactory.createForMessageOrder(
      user,
      'LETTER',
      {
        id: routingConfigIds.validationError,
        name: 'Test message plan for validation error test',
      }
    ).dbEntry,
    nonLetter: RoutingConfigFactory.createForMessageOrder(
      user,
      'NHSAPP,EMAIL,SMS',
      {
        id: routingConfigIds.nonLetter,
        name: 'Test message plan with no letter channel',
      }
    ).dbEntry,
  };
}

const getLanguageDisplayName = (language: Language): string => {
  const languageMap: { [key in Language]?: string } = {
    fr: 'French',
    pl: 'Polish',
    es: 'Spanish',
  };
  return languageMap[language] || language;
};

test.describe('Routing - Choose other language letter templates page', () => {
  let user: TestUser;
  let userWithNoTemplates: TestUser;

  let templates: Record<keyof typeof templateIds, Template>;
  let routingConfigs: Record<
    Exclude<
      keyof typeof routingConfigIds,
      'forUserWithNoTemplates' | 'invalid' | 'notFound'
    >,
    RoutingConfigDbEntry
  >;
  let routingConfigForUserWithNoTemplates: RoutingConfigDbEntry;

  test.beforeAll(async () => {
    user = await createAuthHelper().getTestUser(testUsers.User1.userId);
    userWithNoTemplates = await createAuthHelper().getTestUser(
      testUsers.User2.userId
    );

    templates = getTemplates(user);

    routingConfigs = getRoutingConfigs(user);
    routingConfigForUserWithNoTemplates =
      RoutingConfigFactory.createForMessageOrder(
        userWithNoTemplates,
        'LETTER'
      ).dbEntry;

    await routingConfigStorageHelper.seed([
      ...Object.values(routingConfigs),
      routingConfigForUserWithNoTemplates,
    ]);
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await routingConfigStorageHelper.deleteSeeded();
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new RoutingChooseOtherLanguageLetterTemplatePage(page)
        .setPathParam('messagePlanId', routingConfigIds.valid)
        .setSearchParam('lockNumber', String(routingConfigs.valid.lockNumber)),
      id: routingConfigIds.valid,
      baseURL,
    };
    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertBackLinkBottom({
      ...props,
      expectedUrl: `templates/message-plans/choose-templates/${routingConfigIds.valid}`,
    });
  });

  test('user can view the list of available foreign language templates and go back to the "Choose templates" page without making any changes to their message plan', async ({
    page,
    baseURL,
  }) => {
    const chooseOtherLanguageLetterTemplatePage =
      new RoutingChooseOtherLanguageLetterTemplatePage(page)
        .setPathParam('messagePlanId', routingConfigs.valid.id)
        .setSearchParam('lockNumber', String(routingConfigs.valid.lockNumber));
    await chooseOtherLanguageLetterTemplatePage.loadPage();

    await assertChooseTemplatePageWithTemplatesAvailable({
      page: chooseOtherLanguageLetterTemplatePage,
    });

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-other-language-letter-template/${routingConfigs.valid.id}?lockNumber=${routingConfigs.valid.lockNumber}`
    );

    await expect(
      chooseOtherLanguageLetterTemplatePage.messagePlanName
    ).toHaveText(routingConfigs.valid.name);

    await expect(chooseOtherLanguageLetterTemplatePage.pageHeading).toHaveText(
      'Choose other language letter templates'
    );

    await expect(
      chooseOtherLanguageLetterTemplatePage.tableHintText
    ).toHaveText(
      'Choose all the templates that you want to include in this message plan. You can only choose one template for each language.'
    );

    const table = chooseOtherLanguageLetterTemplatePage.templatesTable;

    for (const templateKey in languageTemplatesToDisplay) {
      const template = templates[templateKey as keyof typeof templates];
      await expect(table.getByText(template.name)).toBeVisible();

      const checkbox = chooseOtherLanguageLetterTemplatePage.getCheckbox(
        template.id
      );
      await expect(checkbox).toBeVisible();
      await expect(checkbox).not.toBeChecked();

      const languageName = getLanguageDisplayName(
        template.language as Language
      );
      const templateRow = table.locator('tr', { hasText: template.name });
      await expect(
        templateRow.getByText(`Standard letter - ${languageName}`)
      ).toBeVisible();

      const previewLink = chooseOtherLanguageLetterTemplatePage.getPreviewLink(
        template.id
      );
      await expect(previewLink).toBeVisible();
      await expect(previewLink).toHaveAttribute(
        'href',
        `/templates/message-plans/choose-other-language-letter-template/${routingConfigs.valid.id}/preview-template/${template.id}?lockNumber=${routingConfigs.valid.lockNumber}`
      );
    }

    await expect(
      table.getByText(templates.FRENCH_LETTER_NOT_SUBMITTED.name)
    ).toBeHidden();
    await expect(table.getByText(templates.NHSAPP.name)).toBeHidden();
    await expect(table.getByText(templates.LETTER.name)).toBeHidden();
    await expect(
      table.getByText(templates.LARGE_PRINT_LETTER.name)
    ).toBeHidden();

    await expect(
      chooseOtherLanguageLetterTemplatePage.saveAndContinueButton
    ).toHaveText('Save and continue');

    await expect(
      chooseOtherLanguageLetterTemplatePage.backLinkBottom
    ).toHaveText('Go back');
    await chooseOtherLanguageLetterTemplatePage.backLinkBottom.click();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-templates/${routingConfigs.valid.id}`
    );
  });

  test.describe('user with no templates', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('user sees a message when no foreign language templates are available and can go to create templates', async ({
      page,
      baseURL,
    }) => {
      await loginAsUser(userWithNoTemplates, page);

      const chooseOtherLanguageLetterTemplatePage =
        new RoutingChooseOtherLanguageLetterTemplatePage(page);
      await chooseOtherLanguageLetterTemplatePage
        .setPathParam('messagePlanId', routingConfigForUserWithNoTemplates.id)
        .setSearchParam(
          'lockNumber',
          String(routingConfigForUserWithNoTemplates.lockNumber)
        )
        .loadPage();

      await assertChooseTemplatePageWithNoTemplates({
        page: chooseOtherLanguageLetterTemplatePage,
      });

      await expect(
        chooseOtherLanguageLetterTemplatePage.messagePlanName
      ).toHaveText(routingConfigForUserWithNoTemplates.name);

      await expect(
        chooseOtherLanguageLetterTemplatePage.noTemplatesMessage
      ).toHaveText('You do not have any other language letter templates yet.');

      await chooseOtherLanguageLetterTemplatePage.goToTemplatesLink.click();

      await expect(page).toHaveURL(`${baseURL}/templates/message-templates`);
    });
  });

  test('user can choose multiple templates for a message plan that has no language templates', async ({
    page,
    baseURL,
  }) => {
    const chooseOtherLanguageLetterTemplatePage =
      new RoutingChooseOtherLanguageLetterTemplatePage(page);

    await chooseOtherLanguageLetterTemplatePage
      .setPathParam('messagePlanId', routingConfigs.valid.id)
      .setSearchParam('lockNumber', String(routingConfigs.valid.lockNumber))
      .loadPage();

    await chooseOtherLanguageLetterTemplatePage
      .getCheckbox(templates.FRENCH_LETTER.id)
      .check();
    await chooseOtherLanguageLetterTemplatePage
      .getCheckbox(templates.SPANISH_LETTER.id)
      .check();
    await chooseOtherLanguageLetterTemplatePage.saveAndContinueButton.click();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-templates/${routingConfigs.valid.id}`
    );

    const chooseTemplatesPage = new RoutingChooseTemplatesPage(page);

    const templateNames =
      chooseTemplatesPage.alternativeLetterFormats().otherLanguages
        .templateNames;
    const templateTexts = await templateNames.allTextContents();
    expect(templateTexts.length).toBe(2);
    expect(templateTexts).toContain(templates.FRENCH_LETTER.name);
    expect(templateTexts).toContain(templates.SPANISH_LETTER.name);
  });

  test('user can add language templates to a message plan that has an accessible format template', async ({
    page,
    baseURL,
  }) => {
    const chooseOtherLanguageLetterTemplatePage =
      new RoutingChooseOtherLanguageLetterTemplatePage(page);
    await chooseOtherLanguageLetterTemplatePage
      .setPathParam(
        'messagePlanId',
        routingConfigs.withAccessibleTemplateSelected.id
      )
      .setSearchParam(
        'lockNumber',
        String(routingConfigs.withAccessibleTemplateSelected.lockNumber)
      )
      .loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-other-language-letter-template/${routingConfigs.withAccessibleTemplateSelected.id}?lockNumber=${routingConfigs.withAccessibleTemplateSelected.lockNumber}`
    );

    await expect(
      chooseOtherLanguageLetterTemplatePage.previousSelectionDetails
    ).toBeHidden();

    await chooseOtherLanguageLetterTemplatePage
      .getCheckbox(templates.FRENCH_LETTER.id)
      .check();
    await chooseOtherLanguageLetterTemplatePage
      .getCheckbox(templates.POLISH_LETTER.id)
      .check();

    await chooseOtherLanguageLetterTemplatePage.saveAndContinueButton.click();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-templates/${routingConfigs.withAccessibleTemplateSelected.id}`
    );

    const chooseTemplatesPage = new RoutingChooseTemplatesPage(page);
    await chooseTemplatesPage
      .setPathParam(
        'messagePlanId',
        routingConfigs.withAccessibleTemplateSelected.id
      )
      .loadPage();

    const otherLanguagesItem =
      chooseTemplatesPage.alternativeLetterFormats().otherLanguages;
    const templateNames = otherLanguagesItem.templateNames;
    const templateTexts = await templateNames.allTextContents();
    expect(templateTexts.length).toBe(2);
    expect(templateTexts).toContain(templates.FRENCH_LETTER.name);
    expect(templateTexts).toContain(templates.POLISH_LETTER.name);

    const largePrintSection =
      chooseTemplatesPage.alternativeLetterFormats().largePrint.templateName;
    await expect(largePrintSection).toContainText(
      templates.LARGE_PRINT_LETTER.name
    );
  });

  test('user can view and change the language templates previously selected on their message plan', async ({
    page,
    baseURL,
  }) => {
    const chooseOtherLanguageLetterTemplatePage =
      new RoutingChooseOtherLanguageLetterTemplatePage(page);
    await chooseOtherLanguageLetterTemplatePage
      .setPathParam(
        'messagePlanId',
        routingConfigs.withLanguageTemplatesSelected.id
      )
      .setSearchParam(
        'lockNumber',
        String(routingConfigs.withLanguageTemplatesSelected.lockNumber)
      )
      .loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-other-language-letter-template/${routingConfigs.withLanguageTemplatesSelected.id}?lockNumber=${routingConfigs.withLanguageTemplatesSelected.lockNumber}`
    );

    const previouslySelected =
      chooseOtherLanguageLetterTemplatePage.previousSelectionDetails;
    await expect(previouslySelected).toContainText(
      'Previously selected templates'
    );
    await expect(previouslySelected).toContainText(
      templates.FRENCH_LETTER.name
    );
    await expect(previouslySelected).toContainText(
      templates.POLISH_LETTER.name
    );

    const frenchCheckbox = chooseOtherLanguageLetterTemplatePage.getCheckbox(
      templates.FRENCH_LETTER.id
    );
    const polishCheckbox = chooseOtherLanguageLetterTemplatePage.getCheckbox(
      templates.POLISH_LETTER.id
    );
    const spanishCheckbox = chooseOtherLanguageLetterTemplatePage.getCheckbox(
      templates.SPANISH_LETTER.id
    );

    await expect(frenchCheckbox).toBeChecked();
    await expect(polishCheckbox).toBeChecked();
    await expect(spanishCheckbox).not.toBeChecked();

    await polishCheckbox.uncheck();
    await spanishCheckbox.check();

    await chooseOtherLanguageLetterTemplatePage.saveAndContinueButton.click();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-templates/${routingConfigs.withLanguageTemplatesSelected.id}`
    );

    const chooseTemplatesPage = new RoutingChooseTemplatesPage(page);
    await chooseTemplatesPage
      .setPathParam(
        'messagePlanId',
        routingConfigs.withLanguageTemplatesSelected.id
      )
      .loadPage();

    const otherLanguagesItem =
      chooseTemplatesPage.alternativeLetterFormats().otherLanguages;
    const templateNames = otherLanguagesItem.templateNames;
    const templateTexts = await templateNames.allTextContents();
    expect(templateTexts.length).toBe(2);
    expect(templateTexts).toContain(templates.FRENCH_LETTER.name);
    expect(templateTexts).toContain(templates.SPANISH_LETTER.name);
  });

  test('user must select at least one template, without duplicate languages - errors update correctly when switching between states', async ({
    page,
    baseURL,
  }) => {
    const chooseOtherLanguageLetterTemplatePage =
      new RoutingChooseOtherLanguageLetterTemplatePage(page);
    await chooseOtherLanguageLetterTemplatePage
      .setPathParam('messagePlanId', routingConfigs.validationError.id)
      .setSearchParam(
        'lockNumber',
        String(routingConfigs.validationError.lockNumber)
      )
      .loadPage();

    await chooseOtherLanguageLetterTemplatePage.saveAndContinueButton.click();

    await page.waitForLoadState('load');

    await expect(
      chooseOtherLanguageLetterTemplatePage.errorSummary
    ).toBeVisible();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-other-language-letter-template/${routingConfigs.validationError.id}?lockNumber=${routingConfigs.validationError.lockNumber}`
    );

    await expect(
      chooseOtherLanguageLetterTemplatePage.errorSummaryHint
    ).toHaveText('You have not chosen any templates');

    let errorLink =
      chooseOtherLanguageLetterTemplatePage.errorSummaryList.first();
    await expect(errorLink).toHaveText('Choose one or more templates');

    await expect(chooseOtherLanguageLetterTemplatePage.formError).toHaveText(
      'Error: Choose one or more templates'
    );

    await chooseOtherLanguageLetterTemplatePage
      .getCheckbox(templates.FRENCH_LETTER.id)
      .check();
    await chooseOtherLanguageLetterTemplatePage
      .getCheckbox(templates.FRENCH_LETTER_APPROVED.id)
      .check();

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(5000); // Wait for debounce

    await chooseOtherLanguageLetterTemplatePage.saveAndContinueButton.click();

    await page.waitForLoadState('load');

    await expect(
      chooseOtherLanguageLetterTemplatePage.errorSummary
    ).toBeVisible();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-other-language-letter-template/${routingConfigs.validationError.id}?lockNumber=${routingConfigs.validationError.lockNumber}`
    );

    await expect(
      chooseOtherLanguageLetterTemplatePage.errorSummaryList.first()
    ).toHaveText('Choose only one template for each language');

    await expect(
      chooseOtherLanguageLetterTemplatePage.errorSummaryHint
    ).toHaveText('You can only choose one template for each language');

    await expect(chooseOtherLanguageLetterTemplatePage.formError).toHaveText(
      'Error: Choose only one template for each language'
    );

    await chooseOtherLanguageLetterTemplatePage
      .getCheckbox(templates.FRENCH_LETTER.id)
      .uncheck();
    await chooseOtherLanguageLetterTemplatePage
      .getCheckbox(templates.FRENCH_LETTER_APPROVED.id)
      .uncheck();

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(5000); // Wait for debounce

    await chooseOtherLanguageLetterTemplatePage.saveAndContinueButton.click();

    await page.waitForLoadState('load');

    await expect(
      chooseOtherLanguageLetterTemplatePage.errorSummary
    ).toBeVisible();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-other-language-letter-template/${routingConfigs.validationError.id}?lockNumber=${routingConfigs.validationError.lockNumber}`
    );

    await expect(
      chooseOtherLanguageLetterTemplatePage.errorSummary.locator('.nhsuk-hint')
    ).toHaveText('You have not chosen any templates');

    errorLink = chooseOtherLanguageLetterTemplatePage.errorSummaryList.first();
    await expect(errorLink).toHaveText('Choose one or more templates');

    await expect(chooseOtherLanguageLetterTemplatePage.formError).toHaveText(
      'Error: Choose one or more templates'
    );

    await chooseOtherLanguageLetterTemplatePage
      .getCheckbox(templates.FRENCH_LETTER.id)
      .check();

    // Wait 5 seconds to avoid debounce blocking the form submission
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(5000);

    await chooseOtherLanguageLetterTemplatePage.saveAndContinueButton.click();

    await page.waitForURL(
      `${baseURL}/templates/message-plans/choose-templates/${routingConfigs.validationError.id}`
    );
  });

  test.describe('redirects to invalid message plan page', () => {
    test('when message plan cannot be found', async ({ page, baseURL }) => {
      const chooseOtherLanguageLetterTemplatePage =
        new RoutingChooseOtherLanguageLetterTemplatePage(page);

      await chooseOtherLanguageLetterTemplatePage
        .setPathParam('messagePlanId', routingConfigIds.notFound)
        .setSearchParam('lockNumber', '1')
        .loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });

    test('when routing config ID is invalid', async ({ page, baseURL }) => {
      const chooseOtherLanguageLetterTemplatePage =
        new RoutingChooseOtherLanguageLetterTemplatePage(page);

      await chooseOtherLanguageLetterTemplatePage
        .setPathParam('messagePlanId', routingConfigIds.invalid)
        .setSearchParam('lockNumber', '1')
        .loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });

    test('when routing config does not have a letter channel', async ({
      page,
      baseURL,
    }) => {
      const chooseOtherLanguageLetterTemplatePage =
        new RoutingChooseOtherLanguageLetterTemplatePage(page);

      await chooseOtherLanguageLetterTemplatePage
        .setPathParam('messagePlanId', routingConfigs.nonLetter.id)
        .setSearchParam(
          'lockNumber',
          String(routingConfigs.nonLetter.lockNumber)
        )
        .loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });
  });

  test.describe('redirects to choose templates page', () => {
    test('when no lockNumber in url', async ({ page, baseURL }) => {
      const chooseTemplatePage =
        new RoutingChooseOtherLanguageLetterTemplatePage(page).setPathParam(
          'messagePlanId',
          routingConfigs.valid.id
        );

      await chooseTemplatePage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/choose-templates/${routingConfigs.valid.id}`
      );
    });
  });
});
