import { test, expect } from '@playwright/test';
import { RoutingConfigStorageHelper } from 'helpers/db/routing-config-storage-helper';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertBackLinkTopNotPresent,
  assertAndClickBackLinkBottom,
} from '../../helpers/template-mgmt-common.steps';
import {
  assertChooseTemplatePageWithTemplatesAvailable,
  assertChooseTemplatePageWithPreviousSelection,
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
import { RoutingChooseLargePrintLetterTemplatePage } from 'pages/routing/letter/choose-large-print-letter-template-page';
import { RoutingConfigDbEntry, Template } from 'helpers/types';
import { RoutingChooseTemplatesPage } from 'pages/routing';

const routingConfigStorageHelper = new RoutingConfigStorageHelper();
const templateStorageHelper = new TemplateStorageHelper();

const templateIds = {
  LARGE_PRINT_LETTER1: randomUUID(),
  LARGE_PRINT_LETTER2: randomUUID(),
  LARGE_PRINT_LETTER3: randomUUID(),
  LARGE_PRINT_LETTER_NOT_SUBMITTED: randomUUID(),
  STANDARD_LETTER: randomUUID(),
  FRENCH_LETTER: randomUUID(),
  APP: randomUUID(),
};

const routingConfigIds = {
  valid: randomUUID(),
  withLargePrintSelected: randomUUID(),
  validationError: randomUUID(),
  nonLetter: randomUUID(),
  invalid: 'invalid-id',
  notFound: randomUUID(),
};

function getTemplates(
  user: TestUser
): Record<keyof typeof templateIds, Template> {
  return {
    LARGE_PRINT_LETTER1: TemplateFactory.uploadLetterTemplate(
      templateIds.LARGE_PRINT_LETTER1,
      user,
      'Large print letter template 1',
      'SUBMITTED',
      'PASSED',
      { letterType: 'x1' }
    ),
    LARGE_PRINT_LETTER2: TemplateFactory.uploadLetterTemplate(
      templateIds.LARGE_PRINT_LETTER2,
      user,
      'Large print letter template 2',
      'SUBMITTED',
      'PASSED',
      { letterType: 'x1' }
    ),
    LARGE_PRINT_LETTER3: TemplateFactory.uploadLetterTemplate(
      templateIds.LARGE_PRINT_LETTER3,
      user,
      'Large print letter template 3',
      'SUBMITTED',
      'PASSED',
      { letterType: 'x1' }
    ),
    LARGE_PRINT_LETTER_NOT_SUBMITTED: TemplateFactory.uploadLetterTemplate(
      templateIds.LARGE_PRINT_LETTER_NOT_SUBMITTED,
      user,
      'Proof available large print letter',
      'PROOF_AVAILABLE',
      'PASSED',
      { letterType: 'x1' }
    ),
    STANDARD_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.STANDARD_LETTER,
      user,
      'Standard letter template',
      'SUBMITTED',
      'PASSED'
    ),
    FRENCH_LETTER: TemplateFactory.uploadLetterTemplate(
      templateIds.FRENCH_LETTER,
      user,
      'French letter template',
      'SUBMITTED',
      'PASSED',
      { language: 'fr' }
    ),
    APP: TemplateFactory.createNhsAppTemplate(
      templateIds.APP,
      user,
      'App template'
    ),
  };
}

function getRoutingConfigs(
  user: TestUser
): Record<
  Exclude<keyof typeof routingConfigIds, 'invalid' | 'notFound'>,
  RoutingConfigDbEntry
> {
  return {
    valid: RoutingConfigFactory.createForMessageOrder(user, 'LETTER', {
      id: routingConfigIds.valid,
      name: 'Test message plan with no templates selected',
    }).dbEntry,
    withLargePrintSelected: RoutingConfigFactory.createForMessageOrder(
      user,
      'LETTER',
      {
        id: routingConfigIds.withLargePrintSelected,
        name: 'Message plan with large print template selected',
      }
    ).addAccessibleFormatTemplate('x1', templateIds.LARGE_PRINT_LETTER2)
      .dbEntry,
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

test.describe('Routing - Choose large print letter template page', () => {
  let user: TestUser;

  let templates: Record<keyof typeof templateIds, Template>;
  let routingConfigs: Record<
    Exclude<keyof typeof routingConfigIds, 'invalid' | 'notFound'>,
    RoutingConfigDbEntry
  >;

  test.beforeAll(async () => {
    user = await createAuthHelper().getTestUser(testUsers.User1.userId);

    templates = getTemplates(user);
    routingConfigs = getRoutingConfigs(user);

    await routingConfigStorageHelper.seed(Object.values(routingConfigs));
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await routingConfigStorageHelper.deleteSeeded();
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new RoutingChooseLargePrintLetterTemplatePage(page)
        .setPathParam('messagePlanId', routingConfigIds.valid)
        .setSearchParam('lockNumber', String(routingConfigs.valid.lockNumber)),
      id: routingConfigIds.valid,
      baseURL,
    };
    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertBackLinkTopNotPresent(props);
    await assertAndClickBackLinkBottom({
      ...props,
      expectedUrl: `templates/message-plans/choose-templates/${routingConfigIds.valid}`,
    });
  });

  test('user can view the list of available large print templates and go back to the "Choose templates" page without making any changes to their message plan', async ({
    page,
    baseURL,
  }) => {
    const chooseLargePrintLetterTemplatePage =
      new RoutingChooseLargePrintLetterTemplatePage(page);
    await chooseLargePrintLetterTemplatePage
      .setPathParam('messagePlanId', routingConfigs.valid.id)
      .setSearchParam('lockNumber', String(routingConfigs.valid.lockNumber))
      .loadPage();

    await assertChooseTemplatePageWithTemplatesAvailable({
      page: chooseLargePrintLetterTemplatePage,
    });

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-large-print-letter-template/${routingConfigs.valid.id}?lockNumber=${routingConfigs.valid.lockNumber}`
    );

    await expect(chooseLargePrintLetterTemplatePage.messagePlanName).toHaveText(
      routingConfigs.valid.name
    );

    await expect(chooseLargePrintLetterTemplatePage.pageHeading).toHaveText(
      'Choose a large print letter template'
    );

    const table = chooseLargePrintLetterTemplatePage.templatesTable;

    for (const template of [
      templates.LARGE_PRINT_LETTER1,
      templates.LARGE_PRINT_LETTER2,
      templates.LARGE_PRINT_LETTER3,
    ]) {
      await expect(table.getByText(template.name)).toBeVisible();
      const radioButton = chooseLargePrintLetterTemplatePage.getRadioButton(
        template.id
      );
      await expect(radioButton).not.toBeChecked();

      const previewLink = chooseLargePrintLetterTemplatePage.getPreviewLink(
        template.id
      );
      await expect(previewLink).toBeVisible();
      await expect(previewLink).toHaveAttribute(
        'href',
        `/templates/message-plans/choose-large-print-letter-template/${routingConfigs.valid.id}/preview-template/${template.id}?lockNumber=${routingConfigs.valid.lockNumber}`
      );
    }

    await expect(
      table.getByText(templates.LARGE_PRINT_LETTER_NOT_SUBMITTED.name)
    ).toBeHidden();
    await expect(table.getByText(templates.STANDARD_LETTER.name)).toBeHidden();
    await expect(table.getByText(templates.FRENCH_LETTER.name)).toBeHidden();
    await expect(table.getByText(templates.APP.name)).toBeHidden();

    await chooseLargePrintLetterTemplatePage.backLinkBottom.click();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-templates/${routingConfigs.valid.id}`
    );
  });

  test('user can select a template for a message plan that has no large print template', async ({
    page,
    baseURL,
  }) => {
    const chooseLargePrintLetterTemplatePage =
      new RoutingChooseLargePrintLetterTemplatePage(page);
    await chooseLargePrintLetterTemplatePage
      .setPathParam('messagePlanId', routingConfigs.valid.id)
      .setSearchParam('lockNumber', String(routingConfigs.valid.lockNumber))
      .loadPage();

    await chooseLargePrintLetterTemplatePage
      .getRadioButton(templates.LARGE_PRINT_LETTER1.id)
      .check();
    await chooseLargePrintLetterTemplatePage.saveAndContinueButton.click();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-templates/${routingConfigs.valid.id}`
    );

    const chooseTemplatesPage = new RoutingChooseTemplatesPage(page);
    await chooseTemplatesPage
      .setPathParam('messagePlanId', routingConfigs.valid.id)
      .loadPage();

    await expect(
      chooseTemplatesPage.alternativeLetterFormats().largePrint.templateName
    ).toHaveText(templates.LARGE_PRINT_LETTER1.name);
  });

  test('user sees an error when trying to save without selecting a template', async ({
    page,
    baseURL,
  }) => {
    const chooseLargePrintLetterTemplatePage =
      new RoutingChooseLargePrintLetterTemplatePage(page);
    await chooseLargePrintLetterTemplatePage
      .setPathParam('messagePlanId', routingConfigs.validationError.id)
      .setSearchParam(
        'lockNumber',
        String(routingConfigs.validationError.lockNumber)
      )
      .loadPage();

    await chooseLargePrintLetterTemplatePage.saveAndContinueButton.click();

    await page.waitForLoadState('load');

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-large-print-letter-template/${routingConfigs.validationError.id}?lockNumber=${routingConfigs.validationError.lockNumber}`
    );

    await expect(chooseLargePrintLetterTemplatePage.errorSummary).toBeVisible();

    await expect(
      chooseLargePrintLetterTemplatePage.errorSummaryHint
    ).toHaveText('You have not chosen a template');

    const errorLink =
      chooseLargePrintLetterTemplatePage.errorSummaryList.first();
    await expect(errorLink).toHaveText('Choose a large print letter template');

    await expect(chooseLargePrintLetterTemplatePage.formError).toHaveText(
      'Error: Choose a large print letter template'
    );

    await chooseLargePrintLetterTemplatePage
      .getRadioButton(templates.LARGE_PRINT_LETTER1.id)
      .check();

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(5000); // Wait for debounce

    await chooseLargePrintLetterTemplatePage.saveAndContinueButton.click();

    await page.waitForURL(
      `${baseURL}/templates/message-plans/choose-templates/${routingConfigs.validationError.id}`
    );
  });

  test('user can view and change the large print template previously selected on their message plan', async ({
    page,
    baseURL,
  }) => {
    const chooseLargePrintLetterTemplatePage =
      new RoutingChooseLargePrintLetterTemplatePage(page);
    await chooseLargePrintLetterTemplatePage
      .setPathParam('messagePlanId', routingConfigs.withLargePrintSelected.id)
      .setSearchParam(
        'lockNumber',
        String(routingConfigs.withLargePrintSelected.lockNumber)
      )
      .loadPage();

    await assertChooseTemplatePageWithPreviousSelection({
      page: chooseLargePrintLetterTemplatePage,
    });

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-large-print-letter-template/${routingConfigs.withLargePrintSelected.id}?lockNumber=${routingConfigs.withLargePrintSelected.lockNumber}`
    );

    await expect(chooseLargePrintLetterTemplatePage.messagePlanName).toHaveText(
      routingConfigs.withLargePrintSelected.name
    );

    const previouslySelected =
      chooseLargePrintLetterTemplatePage.previousSelectionDetails;
    await expect(previouslySelected).toContainText(
      'Previously selected template'
    );
    await expect(previouslySelected).toContainText(
      templates.LARGE_PRINT_LETTER2.name
    );

    const selectedRadio = chooseLargePrintLetterTemplatePage.getRadioButton(
      templates.LARGE_PRINT_LETTER2.id
    );
    await expect(selectedRadio).toBeChecked();

    const newSelection = chooseLargePrintLetterTemplatePage.getRadioButton(
      templates.LARGE_PRINT_LETTER3.id
    );
    await newSelection.check();
    await expect(selectedRadio).not.toBeChecked();

    await chooseLargePrintLetterTemplatePage.saveAndContinueButton.click();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-templates/${routingConfigs.withLargePrintSelected.id}`
    );

    await expect(
      new RoutingChooseTemplatesPage(page).alternativeLetterFormats().largePrint
        .templateName
    ).toHaveText(templates.LARGE_PRINT_LETTER3.name);
  });

  test.describe('redirects to invalid message plan page', () => {
    test('when message plan cannot be found', async ({ page, baseURL }) => {
      const chooseLargePrintLetterTemplatePage =
        new RoutingChooseLargePrintLetterTemplatePage(page);

      await chooseLargePrintLetterTemplatePage
        .setPathParam('messagePlanId', routingConfigIds.notFound)
        .setSearchParam('lockNumber', '1')
        .loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });

    test('when routing config ID is invalid', async ({ page, baseURL }) => {
      const chooseLargePrintLetterTemplatePage =
        new RoutingChooseLargePrintLetterTemplatePage(page);

      await chooseLargePrintLetterTemplatePage
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
      const chooseLargePrintLetterTemplatePage =
        new RoutingChooseLargePrintLetterTemplatePage(page);

      await chooseLargePrintLetterTemplatePage
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
      const chooseTemplatePage = new RoutingChooseLargePrintLetterTemplatePage(
        page
      ).setPathParam('messagePlanId', routingConfigs.valid.id);

      await chooseTemplatePage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/choose-templates/${routingConfigs.valid.id}`
      );
    });
  });
});
