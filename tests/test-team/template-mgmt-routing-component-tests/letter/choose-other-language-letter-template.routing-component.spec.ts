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

const languageTemplates = {
  FRENCH_LETTER: randomUUID(),
  ANOTHER_FRENCH_LETTER: randomUUID(),
  POLISH_LETTER: randomUUID(),
  SPANISH_LETTER: randomUUID(),
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
      'Test Letter template'
    ),
    LARGE_PRINT_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.LARGE_PRINT_LETTER,
      user,
      'Test Large Print Letter template',
      'NOT_YET_SUBMITTED',
      'PASSED',
      { letterType: 'x1' }
    ),
    FRENCH_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.FRENCH_LETTER,
      user,
      'Test French Letter template',
      'NOT_YET_SUBMITTED',
      'PASSED',
      { language: 'fr' }
    ),
    ANOTHER_FRENCH_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.ANOTHER_FRENCH_LETTER,
      user,
      'Test Duplicate French Letter template',
      'NOT_YET_SUBMITTED',
      'PASSED',
      { language: 'fr' }
    ),
    SPANISH_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.SPANISH_LETTER,
      user,
      'Test Spanish Letter template',
      'NOT_YET_SUBMITTED',
      'PASSED',
      { language: 'es' }
    ),
    POLISH_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.POLISH_LETTER,
      user,
      'Test Polish Letter template',
      'NOT_YET_SUBMITTED',
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
      page: new RoutingChooseOtherLanguageLetterTemplatePage(page),
      id: routingConfigIds.valid,
      baseURL,
    };
    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertBackLinkBottom({
      ...props,
      expectedUrl: `/message-plans/choose-templates/${routingConfigIds.valid}`,
    });
  });

  test('user can view the list of available foreign language templates and go back to the "Choose templates" page without making any changes to their message plan', async ({
    page,
    baseURL,
  }) => {
    const chooseOtherLanguageLetterTemplatePage =
      new RoutingChooseOtherLanguageLetterTemplatePage(page);
    await chooseOtherLanguageLetterTemplatePage.loadPage(
      routingConfigs.valid.id
    );

    await assertChooseTemplatePageWithTemplatesAvailable({
      page: chooseOtherLanguageLetterTemplatePage,
    });

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-other-language-letter-template/${routingConfigs.valid.id}`
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

    await expect(chooseOtherLanguageLetterTemplatePage.tableRows).toHaveCount(
      Object.keys(languageTemplates).length
    );

    for (const templateKey in languageTemplates) {
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
      await expect(
        table.getByText(`Standard letter - ${languageName}`)
      ).toBeVisible();

      const previewLink = chooseOtherLanguageLetterTemplatePage.getPreviewLink(
        template.id
      );
      await expect(previewLink).toBeVisible();
      await expect(previewLink).toHaveAttribute(
        'href',
        `/message-plans/choose-other-language-letter-template/${routingConfigs.valid.id}/preview-template/${template.id}`
      );
    }

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

  test('user sees a message when no foreign language templates are available and can go to create templates', async ({
    page,
    baseURL,
  }) => {
    test.use({ storageState: { cookies: [], origins: [] } });

    await loginAsUser(userWithNoTemplates, page);

    const chooseOtherLanguageLetterTemplatePage =
      new RoutingChooseOtherLanguageLetterTemplatePage(page);
    await chooseOtherLanguageLetterTemplatePage.loadPage(
      routingConfigForUserWithNoTemplates.id
    );

    await assertChooseTemplatePageWithNoTemplates({
      page: chooseOtherLanguageLetterTemplatePage,
    });

    await expect(
      chooseOtherLanguageLetterTemplatePage.messagePlanName
    ).toHaveText(routingConfigForUserWithNoTemplates.name);

    await expect(
      chooseOtherLanguageLetterTemplatePage.noTemplatesMessage
    ).toHaveText('You do not have any foreign language letter templates yet.');

    await chooseOtherLanguageLetterTemplatePage.goToTemplatesLink.click();

    await expect(page).toHaveURL(`${baseURL}/templates/message-templates`);
  });

  test('user can choose multiple templates for a message plan that has no language templates', async ({
    page,
    baseURL,
  }) => {
    const chooseOtherLanguageLetterTemplatePage =
      new RoutingChooseOtherLanguageLetterTemplatePage(page);

    await chooseOtherLanguageLetterTemplatePage.loadPage(
      routingConfigs.valid.id
    );

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

    const languageTemplateSection =
      chooseTemplatesPage.alternativeLetterFormats().otherLanguages
        .templateNames;
    await expect(languageTemplateSection).toContainText(
      templates.FRENCH_LETTER.name
    );
    await expect(languageTemplateSection).toContainText(
      templates.SPANISH_LETTER.name
    );
  });

  test('user can add language templates to a message plan that has an accessible format template', async ({
    page,
    baseURL,
  }) => {
    const chooseOtherLanguageLetterTemplatePage =
      new RoutingChooseOtherLanguageLetterTemplatePage(page);
    await chooseOtherLanguageLetterTemplatePage.loadPage(
      routingConfigs.withAccessibleTemplateSelected.id
    );

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-other-language-letter-template/${routingConfigs.withAccessibleTemplateSelected.id}`
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
    await chooseTemplatesPage.loadPage(
      routingConfigs.withAccessibleTemplateSelected.id
    );

    const languageTemplateSection =
      chooseTemplatesPage.alternativeLetterFormats().otherLanguages
        .templateNames;
    await expect(languageTemplateSection).toContainText(
      templates.FRENCH_LETTER.name
    );
    await expect(languageTemplateSection).toContainText(
      templates.POLISH_LETTER.name
    );

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
    await chooseOtherLanguageLetterTemplatePage.loadPage(
      routingConfigs.withLanguageTemplatesSelected.id
    );

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-other-language-letter-template/${routingConfigs.withLanguageTemplatesSelected.id}`
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
    await chooseTemplatesPage.loadPage(
      routingConfigs.withLanguageTemplatesSelected.id
    );

    const languageTemplateSection =
      chooseTemplatesPage.alternativeLetterFormats().otherLanguages
        .templateNames;
    await expect(languageTemplateSection).toContainText(
      templates.FRENCH_LETTER.name
    );
    await expect(languageTemplateSection).toContainText(
      templates.SPANISH_LETTER.name
    );
    await expect(languageTemplateSection).not.toContainText(
      templates.POLISH_LETTER.name
    );
  });

  test('user sees an error when trying to save without selecting any templates', async ({
    page,
    baseURL,
  }) => {
    const chooseOtherLanguageLetterTemplatePage =
      new RoutingChooseOtherLanguageLetterTemplatePage(page);
    await chooseOtherLanguageLetterTemplatePage.loadPage(
      routingConfigs.valid.id
    );

    await chooseOtherLanguageLetterTemplatePage.saveAndContinueButton.click();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-other-language-letter-template/${routingConfigs.valid.id}`
    );

    await expect(
      chooseOtherLanguageLetterTemplatePage.errorSummary
    ).toBeVisible();
    await expect(
      chooseOtherLanguageLetterTemplatePage.errorSummary.locator('.nhsuk-hint')
    ).toHaveText('You have not chosen any templates');

    const errorLink =
      chooseOtherLanguageLetterTemplatePage.errorSummaryList.first();
    await expect(errorLink).toHaveText('Choose one or more templates');

    await expect(chooseOtherLanguageLetterTemplatePage.formError).toHaveText(
      'Error: Choose one or more templates'
    );

    await chooseOtherLanguageLetterTemplatePage
      .getCheckbox(templates.FRENCH_LETTER.id)
      .check();

    await chooseOtherLanguageLetterTemplatePage.saveAndContinueButton.click();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-templates/${routingConfigs.valid.id}`
    );
  });

  test('user cannot select duplicate languages', async ({ page, baseURL }) => {
    const chooseOtherLanguageLetterTemplatePage =
      new RoutingChooseOtherLanguageLetterTemplatePage(page);
    await chooseOtherLanguageLetterTemplatePage.loadPage(
      routingConfigs.valid.id
    );

    await chooseOtherLanguageLetterTemplatePage
      .getCheckbox(templates.FRENCH_LETTER.id)
      .check();
    await chooseOtherLanguageLetterTemplatePage
      .getCheckbox(templates.ANOTHER_FRENCH_LETTER.id)
      .check();
    await chooseOtherLanguageLetterTemplatePage.saveAndContinueButton.click();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-other-language-letter-template/${routingConfigs.valid.id}`
    );

    await expect(
      chooseOtherLanguageLetterTemplatePage.errorSummary
    ).toBeVisible();

    const errorLink =
      chooseOtherLanguageLetterTemplatePage.errorSummaryList.first();
    await expect(errorLink).toHaveText(
      'Choose only one template for each language'
    );

    await expect(
      chooseOtherLanguageLetterTemplatePage.errorSummary.locator('.nhsuk-hint')
    ).toHaveText('You can only choose one template for each language');

    await expect(page.locator('#language-templates--error-message')).toHaveText(
      'Error: Choose only one template for each language'
    );

    await chooseOtherLanguageLetterTemplatePage
      .getCheckbox(templates.ANOTHER_FRENCH_LETTER.id)
      .uncheck();

    await expect(
      chooseOtherLanguageLetterTemplatePage.errorSummary
    ).toBeHidden();

    await chooseOtherLanguageLetterTemplatePage.saveAndContinueButton.click();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-templates/${routingConfigs.valid.id}`
    );
  });

  test.describe('redirects to invalid message plan page', () => {
    test('when message plan cannot be found', async ({ page, baseURL }) => {
      const chooseOtherLanguageLetterTemplatePage =
        new RoutingChooseOtherLanguageLetterTemplatePage(page);

      await chooseOtherLanguageLetterTemplatePage.loadPage(
        routingConfigIds.notFound
      );

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });

    test('when routing config ID is invalid', async ({ page, baseURL }) => {
      const chooseOtherLanguageLetterTemplatePage =
        new RoutingChooseOtherLanguageLetterTemplatePage(page);

      await chooseOtherLanguageLetterTemplatePage.loadPage(
        routingConfigIds.invalid
      );

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

      await chooseOtherLanguageLetterTemplatePage.loadPage(
        routingConfigs.nonLetter.id
      );

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });
  });
});
