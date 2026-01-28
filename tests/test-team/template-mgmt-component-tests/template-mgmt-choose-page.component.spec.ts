import { test, expect } from '@playwright/test';
import { TemplateMgmtChoosePage } from '../pages/template-mgmt-choose-page';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertBackLinkBottomNotPresent,
  assertAndClickBackLinkTop,
} from '../helpers/template-mgmt-common.steps';
import {
  createAuthHelper,
  testUsers,
  type TestUser,
} from '../helpers/auth/cognito-auth-helper';
import { loginAsUser } from '../helpers/auth/login-as-user';

test.describe('Choose Template Type Page', () => {
  test('should land on "Choose Template Type" page when navigating to "/choose-a-template-type" url with empty template', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplateTypePage = new TemplateMgmtChoosePage(page);

    await chooseTemplateTypePage.loadPage();

    await expect(page).toHaveURL(`${baseURL}/templates/choose-a-template-type`);
    await expect(chooseTemplateTypePage.pageHeading).toHaveText(
      'Choose a template type to create'
    );

    await expect(chooseTemplateTypePage.learnMoreLink).toHaveAttribute(
      'href',
      '/features'
    );
  });

  test('common page tests', async ({ page, baseURL }) => {
    const props = {
      page: new TemplateMgmtChoosePage(page),
      id: '',
      baseURL,
    };

    await assertSkipToMainContent(props);
    await assertHeaderLogoLink(props);
    await assertFooterLinks(props);
    await assertSignOutLink(props);
    await assertBackLinkBottomNotPresent(props);
    await assertAndClickBackLinkTop({
      ...props,
      expectedUrl: 'templates/message-templates',
    });
  });

  test('should display correct number of radio button options for template type', async ({
    page,
  }) => {
    const chooseTemplateTypePage = new TemplateMgmtChoosePage(page);

    await chooseTemplateTypePage.loadPage();

    await expect(chooseTemplateTypePage.templateTypeRadioButtons).toHaveCount(
      4
    );

    for (const [templateType, label] of [
      ['nhsapp', 'NHS App message'],
      ['email', 'Email'],
      ['sms', 'Text message'],
      ['letter', 'Letter'],
    ] as const) {
      const radio = chooseTemplateTypePage.getTemplateTypeRadio(templateType);
      await expect(radio).toBeVisible();
      await expect(radio).toHaveAccessibleName(label);
    }
  });

  test('should display error if no template type option selected and continue button clicked', async ({
    page,
    baseURL,
  }) => {
    const chooseTemplateTypePage = new TemplateMgmtChoosePage(page);

    await chooseTemplateTypePage.loadPage();
    await chooseTemplateTypePage.clickContinueButton();

    await expect(page).toHaveURL(`${baseURL}/templates/choose-a-template-type`);

    await expect(chooseTemplateTypePage.errorSummary).toBeVisible();
    await expect(chooseTemplateTypePage.errorSummaryList).toHaveText([
      'Select a template type',
    ]);
  });

  for (const [templateType, path] of [
    ['nhsapp', 'nhs-app'],
    ['email', 'email'],
    ['sms', 'text-message'],
  ] as const)
    test(`should navigate to the ${templateType} template creation page when radio button selected and continue button clicked`, async ({
      page,
      baseURL,
    }) => {
      const chooseTemplateTypePage = new TemplateMgmtChoosePage(page);

      await chooseTemplateTypePage.loadPage();
      await chooseTemplateTypePage.getTemplateTypeRadio(templateType).check();
      await chooseTemplateTypePage.clickContinueButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/create-${path}-template`
      );
    });

  test('should not show letter type conditional radios when Letter is selected', async ({
    page,
  }) => {
    const chooseTemplateTypePage = new TemplateMgmtChoosePage(page);

    await chooseTemplateTypePage.loadPage();
    await chooseTemplateTypePage.getTemplateTypeRadio('letter').check();

    await expect(chooseTemplateTypePage.letterTypeRadioButtons).toHaveCount(0);
  });
});

test.describe('Choose Template Type Page - Letter Authoring Enabled', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  let userLetterAuthoringEnabled: TestUser;

  test.beforeAll(async () => {
    userLetterAuthoringEnabled = await createAuthHelper().getTestUser(
      testUsers.UserLetterAuthoringEnabled.userId
    );
  });

  test('should only show letter type conditional radios when Letter template type is selected', async ({
    page,
  }) => {
    await loginAsUser(userLetterAuthoringEnabled, page);

    const chooseTemplateTypePage = new TemplateMgmtChoosePage(page);
    await chooseTemplateTypePage.loadPage();

    await expect(chooseTemplateTypePage.letterTypeRadioButtons).toHaveCount(0);

    await chooseTemplateTypePage.getTemplateTypeRadio('nhsapp').check();
    await expect(chooseTemplateTypePage.letterTypeRadioButtons).toHaveCount(0);

    await chooseTemplateTypePage.getTemplateTypeRadio('email').check();
    await expect(chooseTemplateTypePage.letterTypeRadioButtons).toHaveCount(0);

    await chooseTemplateTypePage.getTemplateTypeRadio('sms').check();
    await expect(chooseTemplateTypePage.letterTypeRadioButtons).toHaveCount(0);

    await chooseTemplateTypePage.getTemplateTypeRadio('letter').check();
    await expect(chooseTemplateTypePage.letterTypeRadioButtons).toHaveCount(4);

    for (const [letterType, accessibleName] of [
      ['x0', 'Standard English letter'],
      ['x1', 'Large print letter'],
      ['q4', 'British Sign Language letter'],
      ['language', 'Other language letter'],
    ] as const) {
      const radio = chooseTemplateTypePage.getLetterTypeRadio(letterType);
      await expect(radio).toBeVisible();
      await expect(radio).toHaveAccessibleName(accessibleName);
    }
  });

  test('displays validation errors for both template type and letter type fields and navigates to correct upload letter page when resolved', async ({
    page,
    baseURL,
  }) => {
    await loginAsUser(userLetterAuthoringEnabled, page);

    const chooseTemplateTypePage = new TemplateMgmtChoosePage(page);
    await chooseTemplateTypePage.loadPage();

    await chooseTemplateTypePage.clickContinueButton();

    await expect(page).toHaveURL(`${baseURL}/templates/choose-a-template-type`);

    await expect(chooseTemplateTypePage.errorSummary).toBeVisible();
    await expect(chooseTemplateTypePage.errorSummaryHeading).toBeVisible();
    await expect(chooseTemplateTypePage.errorSummaryHint).toHaveText(
      'Select one option'
    );
    await expect(chooseTemplateTypePage.errorSummaryList).toHaveText([
      'Select a template type',
    ]);

    await expect(chooseTemplateTypePage.templateTypeFormError).toContainText(
      'Select a template type'
    );

    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(5000); // Wait for debounce

    await chooseTemplateTypePage.getTemplateTypeRadio('letter').check();

    await chooseTemplateTypePage.clickContinueButton();

    await expect(page).toHaveURL(`${baseURL}/templates/choose-a-template-type`);

    await expect(chooseTemplateTypePage.errorSummary).toBeVisible();
    await expect(chooseTemplateTypePage.errorSummaryHeading).toBeVisible();
    await expect(chooseTemplateTypePage.errorSummaryHint).toHaveText(
      'Select one option'
    );
    await expect(chooseTemplateTypePage.errorSummaryList).toHaveText([
      'Select a letter template type',
    ]);

    await expect(chooseTemplateTypePage.letterTypeFormError).toContainText(
      'Select a letter template type'
    );

    await chooseTemplateTypePage.getLetterTypeRadio('x0').check();

    await chooseTemplateTypePage.clickContinueButton();

    await expect(page).toHaveURL(
      `${baseURL}/templates/upload-standard-english-letter-template`
    );
  });

  for (const [letterType, path] of [
    ['x1', 'upload-large-print-letter-template'],
    ['q4', 'upload-british-sign-language-letter-template'],
    ['language', 'upload-foreign-language-letter-template'],
  ] as const)
    test(`should navigate to ${path} when ${letterType} letter type is selected`, async ({
      page,
      baseURL,
    }) => {
      await loginAsUser(userLetterAuthoringEnabled, page);

      const chooseTemplateTypePage = new TemplateMgmtChoosePage(page);
      await chooseTemplateTypePage.loadPage();

      await chooseTemplateTypePage.getTemplateTypeRadio('letter').check();

      await expect(chooseTemplateTypePage.letterTypeRadioButtons).toHaveCount(
        4
      );

      await chooseTemplateTypePage.getLetterTypeRadio(letterType).check();

      await chooseTemplateTypePage.clickContinueButton();

      await expect(page).toHaveURL(`${baseURL}/templates/${path}`);
    });
});
