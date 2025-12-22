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

  test('should display correct number of radio button options', async ({
    page,
  }) => {
    const chooseTemplateTypePage = new TemplateMgmtChoosePage(page);

    await chooseTemplateTypePage.loadPage();

    await expect(chooseTemplateTypePage.radioButtons).toHaveCount(4);
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

  for (const { label, path } of [
    { label: 'NHS App message', path: 'nhs-app' },
    { label: 'Email', path: 'email' },
    { label: 'Text message (SMS)', path: 'text-message' },
  ])
    test(`should navigate to the ${label} template creation page when radio button selected and continue button clicked`, async ({
      page,
      baseURL,
    }) => {
      const chooseTemplateTypePage = new TemplateMgmtChoosePage(page);

      await chooseTemplateTypePage.loadPage();
      await chooseTemplateTypePage.checkRadioButton(label);
      await chooseTemplateTypePage.clickContinueButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/create-${path}-template`
      );
    });
});
