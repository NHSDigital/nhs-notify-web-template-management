import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/template-storage-helper';
import { TemplateMgmtPreviewEmailPage } from '../../pages/email/template-mgmt-preview-email-page';
import { TemplateFactory } from '../../helpers/template-factory';
import {
  assertFooterLinks,
  assertGoBackLink,
  assertLoginLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from '../template-mgmt-common.steps';

const templates = {
  empty: TemplateFactory.createEmailTemplate('empty-email-preview-template'),
  valid: {
    ...TemplateFactory.createEmailTemplate('valid-email-preview-template'),
    EMAIL: {
      name: 'test-template-email',
      subject: 'test-template-subject-line',
      message: 'test-template-message',
    },
  },
};

test.describe('Preview Email message template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper(
    Object.values(templates)
  );

  test.beforeAll(async () => {
    await templateStorageHelper.seedTemplateData();
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteTemplateData();
  });

  test('when user visits page, then page is loaded', async ({
    page,
    baseURL,
  }) => {
    const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

    await previewEmailTemplatePage.loadPage(templates.valid.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/preview-email-template/${templates.valid.id}`
    );

    // Note; I've broken this check into 2 pieces otherwise it's an unreadable mess of;
    // `Email templatetest-template-email`
    await expect(previewEmailTemplatePage.pageHeader).toContainText(
      'Email template'
    );

    await expect(previewEmailTemplatePage.pageHeader).toContainText(
      'test-template-email'
    );

    await expect(previewEmailTemplatePage.subjectLineText).toHaveText(
      'test-template-subject-line'
    );

    await expect(previewEmailTemplatePage.messageText).toHaveText(
      'test-template-message'
    );
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtPreviewEmailPage(page),
        id: templates.valid.id,
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertNotifyBannerLink(props);
      await assertLoginLink(props);
      await assertFooterLinks(props);
      await assertGoBackLink({
        ...props,
        expectedUrl: `templates/create-email-template/${templates.valid.id}`,
      });
    });

    test('when user clicks "Who your email will be sent from" tool tips, then tool tips are displayed', async ({
      page,
    }) => {
      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage(templates.valid.id);

      await previewEmailTemplatePage.whoYourEmailWillBeSentFrom.click({
        position: { x: 0, y: 0 },
      });

      await expect(
        previewEmailTemplatePage.whoYourEmailWillBeSentFrom
      ).toHaveAttribute('open');
    });

    test('when user submits form with "Edit" data, then the "Create email message template" page is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage(templates.valid.id);

      await previewEmailTemplatePage.editRadioOption.click();

      await previewEmailTemplatePage.clickContinueButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/create-email-template/${templates.valid.id}`
      );
    });

    test('when user submits form with "Submit" data, then the "Are you sure you want to submit" page is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage(templates.valid.id);

      await previewEmailTemplatePage.submitRadioOption.click();

      await previewEmailTemplatePage.clickContinueButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/submit-email-template/${templates.valid.id}`
      );
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with missing data, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage(templates.empty.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage('/fake-template-id');

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user submits page with no data, then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'Select an option';

      const previewEmailTemplatePage = new TemplateMgmtPreviewEmailPage(page);

      await previewEmailTemplatePage.loadPage(templates.valid.id);

      await previewEmailTemplatePage.clickContinueButton();

      await expect(previewEmailTemplatePage.errorSummary).toBeVisible();

      const selectOptionErrorLink =
        previewEmailTemplatePage.errorSummary.locator(
          '[href="#reviewEmailTemplateAction"]'
        );

      await expect(selectOptionErrorLink).toHaveText(errorMessage);

      await selectOptionErrorLink.click();

      await expect(page.locator('#reviewEmailTemplateAction')).toBeInViewport();
    });
  });
});
