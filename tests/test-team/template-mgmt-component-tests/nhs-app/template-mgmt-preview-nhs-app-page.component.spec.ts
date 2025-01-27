import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateMgmtPreviewNhsAppPage } from '../../pages/nhs-app/template-mgmt-preview-nhs-app-page';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import {
  assertBackToAllTemplatesBottomLink,
  assertBackToAllTemplatesTopLink,
} from '../template-mgmt-preview-common.steps';
import {
  assertFooterLinks,
  assertLogoutLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from '../template-mgmt-common.steps';
import { Template, TemplateType, TemplateStatus } from '../../helpers/types';
import {
  createAuthHelper,
  TestUserId,
} from '../../helpers/auth/cognito-auth-helper';

async function createTemplates() {
  const user = await createAuthHelper().getTestUser(TestUserId.User1);
  return {
    empty: {
      id: 'preview-page-invalid-nhs-app-template',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      owner: user.userId,
    } as Template,
    valid: {
      ...TemplateFactory.createNhsAppTemplate(
        'valid-nhs-app-preview-template',
        user.userId
      ),
      name: 'test-template-nhs-app',
      message: 'test-template-message',
    },
  };
}

test.describe('Preview NHS App template Page', () => {
  let templates: { empty: Template; valid: Template };

  const templateStorageHelper = new TemplateStorageHelper();

  test.beforeAll(async () => {
    templates = await createTemplates();
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('when user visits page, then page is loaded', async ({
    page,
    baseURL,
  }) => {
    const previewNhsAppTemplatePage = new TemplateMgmtPreviewNhsAppPage(page);

    await previewNhsAppTemplatePage.loadPage(templates.valid.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/preview-nhs-app-template/${templates.valid.id}`
    );

    await expect(previewNhsAppTemplatePage.editRadioOption).not.toBeChecked();

    await expect(previewNhsAppTemplatePage.submitRadioOption).not.toBeChecked();

    await expect(previewNhsAppTemplatePage.pageHeader).toContainText(
      'test-template-nhs-app'
    );

    await expect(previewNhsAppTemplatePage.messageText).toHaveText(
      'test-template-message'
    );
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtPreviewNhsAppPage(page),
        id: templates.valid.id,
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertNotifyBannerLink(props);
      await assertLogoutLink(props);
      await assertFooterLinks(props);
      await assertBackToAllTemplatesTopLink(props);
      await assertBackToAllTemplatesBottomLink(props);
    });

    test('when user submits form with "Edit" data, then the "Create NHS App message template" page is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewNhsAppTemplatePage = new TemplateMgmtPreviewNhsAppPage(page);

      await previewNhsAppTemplatePage.loadPage(templates.valid.id);

      await previewNhsAppTemplatePage.editRadioOption.click();

      await previewNhsAppTemplatePage.clickSubmitButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/edit-nhs-app-template/${templates.valid.id}`
      );
    });

    test('when user submits form with "Submit" data, then the "Are you sure you want to submit" page is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewNhsAppTemplatePage = new TemplateMgmtPreviewNhsAppPage(page);

      await previewNhsAppTemplatePage.loadPage(templates.valid.id);

      await previewNhsAppTemplatePage.submitRadioOption.click();

      await previewNhsAppTemplatePage.clickSubmitButton();

      await expect(page).toHaveURL(
        `${baseURL}/templates/submit-nhs-app-template/${templates.valid.id}`
      );
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with missing data, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewNhsAppTemplatePage = new TemplateMgmtPreviewNhsAppPage(page);

      await previewNhsAppTemplatePage.loadPage(templates.empty.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewNhsAppTemplatePage = new TemplateMgmtPreviewNhsAppPage(page);

      await previewNhsAppTemplatePage.loadPage('/fake-template-id');

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user submits page with no data, then an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'Select an option';

      const previewNhsAppTemplatePage = new TemplateMgmtPreviewNhsAppPage(page);

      await previewNhsAppTemplatePage.loadPage(templates.valid.id);

      await previewNhsAppTemplatePage.clickSubmitButton();

      await expect(previewNhsAppTemplatePage.errorSummary).toBeVisible();

      const selectOptionErrorLink =
        previewNhsAppTemplatePage.errorSummary.locator(
          '[href="#reviewNHSAppTemplateAction"]'
        );

      await expect(selectOptionErrorLink).toHaveText(errorMessage);

      await selectOptionErrorLink.click();

      await expect(
        page.locator('#reviewNHSAppTemplateAction')
      ).toBeInViewport();
    });
  });
});
