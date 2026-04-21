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
  assertChooseTemplatePageWithNoTemplates,
} from '../routing-common.steps';
import { RoutingConfigFactory } from 'helpers/factories/routing-config-factory';
import { TestUser, testUsers } from 'helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';
import { randomUUID } from 'node:crypto';
import { TemplateFactory } from 'helpers/factories/template-factory';
import { RoutingChooseBritishSignLanguageLetterTemplatePage } from 'pages/routing/letter/choose-british-sign-language-letter-template-page';
import { RoutingConfigDbEntry, Template } from 'helpers/types';
import { getTestContext } from 'helpers/context/context';
import { RoutingEditMessagePlanPage } from 'pages/routing';

const routingConfigStorageHelper = new RoutingConfigStorageHelper();
const templateStorageHelper = new TemplateStorageHelper();

const templateIds = {
  BSL_LETTER1: randomUUID(),
  BSL_LETTER2: randomUUID(),
  BSL_LETTER_APPROVED: randomUUID(),
  BSL_LETTER_NOT_SUBMITTED: randomUUID(),
  STANDARD_LETTER: randomUUID(),
  LARGE_PRINT_LETTER: randomUUID(),
  DIFFERENT_CAMPAIGN_LETTER: randomUUID(),
  APP: randomUUID(),
};

const routingConfigIds = {
  valid: randomUUID(),
  withBSLSelected: randomUUID(),
  validationError: randomUUID(),
  nonLetter: randomUUID(),
  withNoTemplates: randomUUID(),
  invalid: 'invalid-id',
  notFound: randomUUID(),
};

function getTemplates(
  user: TestUser
): Record<keyof typeof templateIds, Template> {
  return {
    BSL_LETTER1: TemplateFactory.createAuthoringLetterTemplate(
      templateIds.BSL_LETTER1,
      user,
      'BSL letter template 1',
      'SUBMITTED',
      {
        letterType: 'q4',
        shortFormRender: { status: 'RENDERED' },
        longFormRender: { status: 'RENDERED' },
      }
    ),
    BSL_LETTER2: TemplateFactory.createAuthoringLetterTemplate(
      templateIds.BSL_LETTER2,
      user,
      'BSL letter template 2',
      'SUBMITTED',
      {
        letterType: 'q4',
        shortFormRender: { status: 'RENDERED' },
        longFormRender: { status: 'RENDERED' },
      }
    ),
    BSL_LETTER_APPROVED: TemplateFactory.createAuthoringLetterTemplate(
      templateIds.BSL_LETTER_APPROVED,
      user,
      'BSL letter template 3 - proof approved',
      'PROOF_APPROVED',
      {
        letterType: 'q4',
        shortFormRender: { status: 'RENDERED' },
        longFormRender: { status: 'RENDERED' },
      }
    ),
    BSL_LETTER_NOT_SUBMITTED: TemplateFactory.createAuthoringLetterTemplate(
      templateIds.BSL_LETTER_NOT_SUBMITTED,
      user,
      'Proof available BSL letter',
      'NOT_YET_SUBMITTED',
      { letterType: 'q4' }
    ),
    STANDARD_LETTER: TemplateFactory.createAuthoringLetterTemplate(
      templateIds.STANDARD_LETTER,
      user,
      'Standard letter template',
      'SUBMITTED',
      {
        shortFormRender: { status: 'RENDERED' },
        longFormRender: { status: 'RENDERED' },
      }
    ),
    LARGE_PRINT_LETTER: TemplateFactory.createAuthoringLetterTemplate(
      templateIds.LARGE_PRINT_LETTER,
      user,
      'Large print letter template',
      'SUBMITTED',
      {
        letterType: 'x1',
        shortFormRender: { status: 'RENDERED' },
        longFormRender: { status: 'RENDERED' },
      }
    ),
    DIFFERENT_CAMPAIGN_LETTER: TemplateFactory.createAuthoringLetterTemplate(
      templateIds.DIFFERENT_CAMPAIGN_LETTER,
      user,
      'Different campaign BSL letter',
      'SUBMITTED',
      {
        campaignId: 'different-campaign',
        letterType: 'q4',
        shortFormRender: { status: 'RENDERED' },
        longFormRender: { status: 'RENDERED' },
      }
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
    withBSLSelected: RoutingConfigFactory.createForMessageOrder(
      user,
      'LETTER',
      {
        id: routingConfigIds.withBSLSelected,
        name: 'Message plan with BSL template selected',
      }
    ).addAccessibleFormatTemplate('q4', templateIds.BSL_LETTER2).dbEntry,
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
    withNoTemplates: RoutingConfigFactory.createForMessageOrder(
      user,
      'LETTER',
      {
        id: routingConfigIds.withNoTemplates,
        name: 'Test message plan with no matching BSL templates',
        campaignId: 'no-matching-campaign',
      }
    ).dbEntry,
  };
}

test.describe('Routing - Choose British Sign Language letter template page', () => {
  let user: TestUser;

  let templates: Record<keyof typeof templateIds, Template>;
  let routingConfigs: Record<
    Exclude<keyof typeof routingConfigIds, 'invalid' | 'notFound'>,
    RoutingConfigDbEntry
  >;

  test.beforeAll(async () => {
    const context = getTestContext();
    user = await context.auth.getTestUser(testUsers.User1.userId);

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
      page: new RoutingChooseBritishSignLanguageLetterTemplatePage(page)
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
      expectedUrl: `templates/message-plans/edit-message-plan/${routingConfigIds.valid}`,
    });
  });

  test('user can view the list of available BSL templates and go back to the "Choose templates" page without making any changes to their message plan', async ({
    page,
    baseURL,
  }) => {
    const chooseBSLLetterTemplatePage =
      new RoutingChooseBritishSignLanguageLetterTemplatePage(page);
    await chooseBSLLetterTemplatePage
      .setPathParam('messagePlanId', routingConfigs.valid.id)
      .setSearchParam('lockNumber', String(routingConfigs.valid.lockNumber))
      .loadPage();

    await assertChooseTemplatePageWithTemplatesAvailable({
      page: chooseBSLLetterTemplatePage,
    });

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-british-sign-language-letter-template/${routingConfigs.valid.id}?lockNumber=${routingConfigs.valid.lockNumber}`
    );

    await expect(chooseBSLLetterTemplatePage.messagePlanName).toHaveText(
      routingConfigs.valid.name
    );

    const table = chooseBSLLetterTemplatePage.templatesTable;

    for (const template of [
      templates.BSL_LETTER1,
      templates.BSL_LETTER2,
      templates.BSL_LETTER_APPROVED,
    ]) {
      await expect(table.getByText(template.name)).toBeVisible();
      const radioButton = chooseBSLLetterTemplatePage.getRadioButton(
        template.id
      );
      await expect(radioButton).not.toBeChecked();

      const previewLink = chooseBSLLetterTemplatePage.getPreviewLink(
        template.id
      );
      await expect(previewLink).toBeVisible();
      await expect(previewLink).toHaveAttribute(
        'href',
        `/templates/message-plans/choose-british-sign-language-letter-template/${routingConfigs.valid.id}/preview-template/${template.id}?lockNumber=${routingConfigs.valid.lockNumber}`
      );
    }

    await expect(
      table.getByText(templates.BSL_LETTER_NOT_SUBMITTED.name)
    ).toBeHidden();
    await expect(
      table.getByText(templates.DIFFERENT_CAMPAIGN_LETTER.name)
    ).toBeHidden();
    await expect(table.getByText(templates.STANDARD_LETTER.name)).toBeHidden();
    await expect(
      table.getByText(templates.LARGE_PRINT_LETTER.name)
    ).toBeHidden();
    await expect(table.getByText(templates.APP.name)).toBeHidden();

    await chooseBSLLetterTemplatePage.backLinkBottom.click();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/edit-message-plan/${routingConfigs.valid.id}`
    );
  });

  test('user can select a template for a message plan that has no BSL template', async ({
    page,
    baseURL,
  }) => {
    const chooseBSLLetterTemplatePage =
      new RoutingChooseBritishSignLanguageLetterTemplatePage(page);
    await chooseBSLLetterTemplatePage
      .setPathParam('messagePlanId', routingConfigs.valid.id)
      .setSearchParam('lockNumber', String(routingConfigs.valid.lockNumber))
      .loadPage();

    await chooseBSLLetterTemplatePage
      .getRadioButton(templates.BSL_LETTER1.id)
      .check();
    await chooseBSLLetterTemplatePage.saveAndContinueButton.click();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/edit-message-plan/${routingConfigs.valid.id}`
    );

    const editMessagePlanPage = new RoutingEditMessagePlanPage(page);
    await editMessagePlanPage
      .setPathParam('messagePlanId', routingConfigs.valid.id)
      .loadPage();

    await expect(
      editMessagePlanPage.alternativeLetterFormats().britishSignLanguage
        .templateName
    ).toHaveText(templates.BSL_LETTER1.name);
  });

  test('user sees an error when trying to save without selecting a template', async ({
    page,
    baseURL,
  }) => {
    const chooseBSLLetterTemplatePage =
      new RoutingChooseBritishSignLanguageLetterTemplatePage(page);
    await chooseBSLLetterTemplatePage
      .setPathParam('messagePlanId', routingConfigs.validationError.id)
      .setSearchParam(
        'lockNumber',
        String(routingConfigs.validationError.lockNumber)
      )
      .loadPage();

    await chooseBSLLetterTemplatePage.saveAndContinueButton.click();

    await page.waitForLoadState('load');

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-british-sign-language-letter-template/${routingConfigs.validationError.id}?lockNumber=${routingConfigs.validationError.lockNumber}`
    );

    await expect(chooseBSLLetterTemplatePage.errorSummary).toBeVisible();

    await expect(chooseBSLLetterTemplatePage.errorSummaryHint).toHaveText(
      'You have not chosen a template'
    );

    const errorLink = chooseBSLLetterTemplatePage.errorSummaryList.first();
    await expect(errorLink).toHaveText(
      'Choose a British Sign Language letter template'
    );

    await expect(chooseBSLLetterTemplatePage.formError).toHaveText(
      'Error: Choose a British Sign Language letter template'
    );

    await chooseBSLLetterTemplatePage
      .getRadioButton(templates.BSL_LETTER1.id)
      .check();

    // TODO CCM-12653 reduce
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(5000); // Wait for debounce

    await chooseBSLLetterTemplatePage.saveAndContinueButton.click();

    await page.waitForURL(
      `${baseURL}/templates/message-plans/edit-message-plan/${routingConfigs.validationError.id}`
    );
  });

  test('user can change a previously selected BSL template', async ({
    page,
    baseURL,
  }) => {
    const chooseBSLLetterTemplatePage =
      new RoutingChooseBritishSignLanguageLetterTemplatePage(page);
    await chooseBSLLetterTemplatePage
      .setPathParam('messagePlanId', routingConfigs.withBSLSelected.id)
      .setSearchParam(
        'lockNumber',
        String(routingConfigs.withBSLSelected.lockNumber)
      )
      .loadPage();

    await assertChooseTemplatePageWithPreviousSelection({
      page: chooseBSLLetterTemplatePage,
    });

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-british-sign-language-letter-template/${routingConfigs.withBSLSelected.id}?lockNumber=${routingConfigs.withBSLSelected.lockNumber}`
    );

    await expect(chooseBSLLetterTemplatePage.messagePlanName).toHaveText(
      routingConfigs.withBSLSelected.name
    );

    const previouslySelected =
      chooseBSLLetterTemplatePage.previousSelectionDetails;
    await expect(previouslySelected).toContainText(
      'Previously selected template'
    );
    await expect(previouslySelected).toContainText(templates.BSL_LETTER2.name);

    const selectedRadio = chooseBSLLetterTemplatePage.getRadioButton(
      templates.BSL_LETTER2.id
    );
    await expect(selectedRadio).toBeChecked();

    const newSelection = chooseBSLLetterTemplatePage.getRadioButton(
      templates.BSL_LETTER_APPROVED.id
    );
    await newSelection.check();
    await expect(selectedRadio).not.toBeChecked();

    await chooseBSLLetterTemplatePage.saveAndContinueButton.click();

    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/edit-message-plan/${routingConfigs.withBSLSelected.id}`
    );

    await expect(
      new RoutingEditMessagePlanPage(page).alternativeLetterFormats()
        .britishSignLanguage.templateName
    ).toHaveText(templates.BSL_LETTER_APPROVED.name);
  });

  test('user sees the no templates version of the page when no BSL letter templates match the campaign filter', async ({
    page,
  }) => {
    const chooseBSLLetterTemplatePage =
      new RoutingChooseBritishSignLanguageLetterTemplatePage(page);
    await chooseBSLLetterTemplatePage
      .setPathParam('messagePlanId', routingConfigs.withNoTemplates.id)
      .setSearchParam(
        'lockNumber',
        String(routingConfigs.withNoTemplates.lockNumber)
      )
      .loadPage();

    await expect(chooseBSLLetterTemplatePage.messagePlanName).toHaveText(
      routingConfigs.withNoTemplates.name
    );

    await assertChooseTemplatePageWithNoTemplates({
      page: chooseBSLLetterTemplatePage,
    });
  });

  test.describe('redirects to invalid message plan page', () => {
    test('when message plan cannot be found', async ({ page, baseURL }) => {
      const chooseBSLLetterTemplatePage =
        new RoutingChooseBritishSignLanguageLetterTemplatePage(page);

      await chooseBSLLetterTemplatePage
        .setPathParam('messagePlanId', routingConfigIds.notFound)
        .setSearchParam('lockNumber', '1')
        .loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });

    test('when routing config ID is invalid', async ({ page, baseURL }) => {
      const chooseBSLLetterTemplatePage =
        new RoutingChooseBritishSignLanguageLetterTemplatePage(page);

      await chooseBSLLetterTemplatePage
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
      const chooseBSLLetterTemplatePage =
        new RoutingChooseBritishSignLanguageLetterTemplatePage(page);

      await chooseBSLLetterTemplatePage
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

  test.describe('redirects to the edit message plan page', () => {
    test('when no lockNumber in url', async ({ page, baseURL }) => {
      const chooseTemplatePage =
        new RoutingChooseBritishSignLanguageLetterTemplatePage(
          page
        ).setPathParam('messagePlanId', routingConfigs.valid.id);

      await chooseTemplatePage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/edit-message-plan/${routingConfigs.valid.id}`
      );
    });
  });
});
