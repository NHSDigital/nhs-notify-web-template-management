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
  assertChooseTemplatePageWithPreviousSelection,
  assertChooseTemplatePageWithTemplatesAvailable,
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
import { RoutingChooseStandardLetterTemplatePage } from 'pages/routing/letter/choose-standard-letter-template-page';

const routingConfigStorageHelper = new RoutingConfigStorageHelper();
const templateStorageHelper = new TemplateStorageHelper();

const invalidMessagePlanId = 'invalid-id';
const notFoundMessagePlanId = '54c87d10-8189-48ad-a30d-42c0c1a6b9dc';

function createMessagePlans(user: TestUser) {
  return {
    LETTER_ROUTING_CONFIG: RoutingConfigFactory.createForMessageOrder(
      user,
      'LETTER'
    ).dbEntry,
    NON_LETTER_ROUTING_CONFIG: RoutingConfigFactory.createForMessageOrder(
      user,
      'NHSAPP'
    ).dbEntry,
  };
}

function createTemplates(user: TestUser) {
  return {
    LETTER1: TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      user,
      'Submitted letter template 1',
      'SUBMITTED'
    ),
    LETTER2: TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      user,
      'Submitted letter template 2',
      'SUBMITTED'
    ),
    LETTER_APPROVED: TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      user,
      'Submitted letter template - proof approved',
      'PROOF_APPROVED'
    ),
    LETTER_NOT_SUBMITTED: TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      user,
      'Proof available letter template',
      'PROOF_AVAILABLE'
    ),
    FRENCH_LETTER: TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      user,
      'French letter template',
      'SUBMITTED',
      { language: 'fr' }
    ),
    ACCESSIBLE_LETTER: TemplateFactory.createAuthoringLetterTemplate(
      randomUUID(),
      user,
      'Accessible letter template',
      'SUBMITTED',
      { letterType: 'x1' }
    ),
    APP: TemplateFactory.createNhsAppTemplate(
      randomUUID(),
      user,
      'App template'
    ),
  };
}

test.describe('Routing - Choose letter template page', () => {
  let messagePlans: ReturnType<typeof createMessagePlans>;
  let templates: ReturnType<typeof createTemplates>;

  test.beforeAll(async () => {
    const user = await createAuthHelper().getTestUser(testUsers.User1.userId);

    messagePlans = createMessagePlans(user);
    templates = createTemplates(user);

    await routingConfigStorageHelper.seed(Object.values(messagePlans));
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await routingConfigStorageHelper.deleteSeeded();
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('common page tests', async ({ page, baseURL }) => {
    const plan = messagePlans.LETTER_ROUTING_CONFIG;
    const props = {
      page: new RoutingChooseStandardLetterTemplatePage(page)
        .setPathParam('messagePlanId', plan.id)
        .setSearchParam('lockNumber', String(plan.lockNumber)),
      baseURL,
    };
    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertBackLinkTopNotPresent(props);
    await assertAndClickBackLinkBottom({
      ...props,
      expectedUrl: `templates/message-plans/choose-templates/${messagePlans.LETTER_ROUTING_CONFIG.id}`,
    });
  });

  test('loads the choose letter template page for a message plan with a letter channel', async ({
    page,
    baseURL,
  }) => {
    const plan = messagePlans.LETTER_ROUTING_CONFIG;
    const chooseLetterTemplatePage =
      new RoutingChooseStandardLetterTemplatePage(page)
        .setPathParam('messagePlanId', plan.id)
        .setSearchParam('lockNumber', String(plan.lockNumber));
    await chooseLetterTemplatePage.loadPage();
    await expect(page).toHaveURL(
      `${baseURL}/templates/message-plans/choose-standard-english-letter-template/${plan.id}?lockNumber=${plan.lockNumber}`
    );

    await test.step('displays list of letter templates to choose from', async () => {
      await assertChooseTemplatePageWithTemplatesAvailable({
        page: chooseLetterTemplatePage,
      });

      await expect(chooseLetterTemplatePage.messagePlanName).toHaveText(
        messagePlans.LETTER_ROUTING_CONFIG.name
      );

      const table = page.getByTestId('channel-templates-table');
      await expect(table).toBeVisible();
      await expect(
        table.getByTestId('channel-templates-table-header-template-select')
      ).toHaveText('Select');
      await expect(
        table.getByTestId('channel-templates-table-header-template-name')
      ).toHaveText('Name');
      await expect(
        table.getByTestId('channel-templates-table-header-template-type')
      ).toHaveText('Type');
      await expect(
        table.getByTestId('channel-templates-table-header-template-last-edited')
      ).toHaveText('Last edited');
      await expect(
        table.getByTestId('channel-templates-table-header-template-action')
      ).toHaveText('');

      for (const template of [
        templates.LETTER1,
        templates.LETTER2,
        templates.LETTER_APPROVED,
      ]) {
        await expect(table.getByText(template.name)).toBeVisible();

        const radioButton = chooseLetterTemplatePage.getRadioButton(
          template.id
        );
        await expect(radioButton).toBeVisible();
        await expect(radioButton).toHaveAttribute('value', template.id);
        await expect(radioButton).not.toBeChecked();

        const previewLink = chooseLetterTemplatePage.getPreviewLink(
          template.id
        );
        await expect(previewLink).toBeVisible();
        await expect(previewLink).toHaveText('Preview');
        await expect(previewLink).toHaveAttribute(
          'href',
          `/templates/message-plans/choose-standard-english-letter-template/${plan.id}/preview-template/${template.id}?lockNumber=${plan.lockNumber}`
        );
      }

      // template filtering checks
      await expect(table.getByText(templates.FRENCH_LETTER.name)).toBeHidden();
      await expect(
        table.getByText(templates.ACCESSIBLE_LETTER.name)
      ).toBeHidden();
      await expect(table.getByText(templates.APP.name)).toBeHidden();
      await expect(
        table.getByText(templates.LETTER_NOT_SUBMITTED.name)
      ).toBeHidden();

      const submitButton = chooseLetterTemplatePage.saveAndContinueButton;
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toHaveText('Save and continue');

      const goBackLink = chooseLetterTemplatePage.backLinkBottom;
      await expect(goBackLink).toBeVisible();
      await expect(goBackLink).toHaveAttribute(
        'href',
        `/templates/message-plans/choose-templates/${plan.id}`
      );
    });

    await test.step('errors on no selection', async () => {
      await chooseLetterTemplatePage.saveAndContinueButton.click();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/choose-standard-english-letter-template/${plan.id}?lockNumber=${plan.lockNumber}`
      );

      await expect(chooseLetterTemplatePage.errorSummary).toBeVisible();
      await expect(chooseLetterTemplatePage.errorSummaryList).toHaveText([
        'Choose a letter template',
      ]);
    });

    await test.step('submits selected template and navigates to choose templates page', async () => {
      await chooseLetterTemplatePage.loadPage();

      await chooseLetterTemplatePage
        .getRadioButton(templates.LETTER2.id)
        .check();
      await chooseLetterTemplatePage.saveAndContinueButton.click();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/choose-templates/${plan.id}`
      );
    });

    await test.step('pre-selects previously selected template', async () => {
      await chooseLetterTemplatePage.loadPage();

      await assertChooseTemplatePageWithPreviousSelection({
        page: chooseLetterTemplatePage,
      });

      await expect(chooseLetterTemplatePage.messagePlanName).toHaveText(
        messagePlans.LETTER_ROUTING_CONFIG.name
      );

      await expect(
        chooseLetterTemplatePage.previousSelectionDetails
      ).toContainText('Previously selected template');
      await expect(
        chooseLetterTemplatePage.previousSelectionDetails
      ).toContainText(templates.LETTER2.name);

      const selectedRadio = chooseLetterTemplatePage.getRadioButton(
        templates.LETTER2.id
      );
      await expect(selectedRadio).toBeChecked();
    });
  });

  test.describe('redirects to invalid message plan page', () => {
    test('when message plan cannot be found', async ({ page, baseURL }) => {
      const chooseLetterTemplatePage =
        new RoutingChooseStandardLetterTemplatePage(page)
          .setPathParam('messagePlanId', notFoundMessagePlanId)
          .setSearchParam('lockNumber', '42');

      await chooseLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });

    test('when routing config ID is invalid', async ({ page, baseURL }) => {
      const chooseLetterTemplatePage =
        new RoutingChooseStandardLetterTemplatePage(page)
          .setPathParam('messagePlanId', invalidMessagePlanId)
          .setSearchParam('lockNumber', '42');

      await chooseLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });

    test('when routing config does not have an letter channel', async ({
      page,
      baseURL,
    }) => {
      const chooseLetterTemplatePage =
        new RoutingChooseStandardLetterTemplatePage(page)
          .setPathParam(
            'messagePlanId',
            messagePlans.NON_LETTER_ROUTING_CONFIG.id
          )
          .setSearchParam(
            'lockNumber',
            String(messagePlans.NON_LETTER_ROUTING_CONFIG.lockNumber)
          );

      await chooseLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/invalid`
      );
    });
  });

  test.describe('redirects to choose templates page', () => {
    test('when no lockNumber in url', async ({ page, baseURL }) => {
      const chooseTemplatePage = new RoutingChooseStandardLetterTemplatePage(
        page
      ).setPathParam('messagePlanId', messagePlans.LETTER_ROUTING_CONFIG.id);

      await chooseTemplatePage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/message-plans/choose-templates/${messagePlans.LETTER_ROUTING_CONFIG.id}`
      );
    });
  });
});
