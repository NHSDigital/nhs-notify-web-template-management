import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateMgmtPreviewNhsAppPage } from '../../pages/nhs-app/template-mgmt-preview-nhs-app-page';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import {
  assertBackLinkBottom,
  assertAndClickBackLinkTop,
} from '../../helpers/template-mgmt-common.steps';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
} from '../../helpers/template-mgmt-common.steps';
import { Template } from '../../helpers/types';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';
import { loginAsUser } from 'helpers/auth/login-as-user';

let routingDisabledUser: TestUser;

async function createTemplates() {
  const authHelper = createAuthHelper();
  const user = await authHelper.getTestUser(testUsers.User1.userId);
  routingDisabledUser = await authHelper.getTestUser(testUsers.User3.userId);

  return {
    empty: {
      id: 'c9a43c53-a523-4431-b1cd-60fc7ba183d6',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateType: 'NHS_APP',
      templateStatus: 'NOT_YET_SUBMITTED',
      owner: `CLIENT#${user.clientId}`,
    } as Template,
    valid: {
      ...TemplateFactory.createNhsAppTemplate(
        '825c809a-e781-4085-984b-90dc620947ba',
        user,
        'valid-nhs-app-preview-template'
      ),
      message: 'test-template-message',
    },
    routingDisabled: {
      ...TemplateFactory.createNhsAppTemplate(
        randomUUID(),
        routingDisabledUser
      ),
      name: 'nhs-app-template-routing-disabled',
      message: 'test-template-message',
    },
  };
}

test.describe('Preview NHS App template Page', () => {
  let templates: {
    empty: Template;
    valid: Template;
    routingDisabled: Template;
  };

  const templateStorageHelper = new TemplateStorageHelper();

  test.beforeAll(async () => {
    templates = await createTemplates();
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('when user visits page, then page is loaded', async ({
    baseURL,
    page,
  }) => {
    const previewPage = new TemplateMgmtPreviewNhsAppPage(page).setPathParam(
      'templateId',
      templates.valid.id
    );

    await previewPage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/preview-nhs-app-template/${templates.valid.id}`
    );

    await expect(previewPage.pageHeading).toContainText(templates.valid.name);

    await expect(previewPage.messageText).toHaveText('test-template-message');

    await expect(previewPage.continueButton).toBeHidden();

    await expect(previewPage.editButton).toBeVisible();
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtPreviewNhsAppPage(page).setPathParam(
          'templateId',
          templates.valid.id
        ),
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertHeaderLogoLink(props);
      await assertSignOutLink(props);
      await assertFooterLinks(props);
      await assertBackLinkBottom({
        ...props,
        expectedUrl: `templates/message-templates`,
      });
      await assertAndClickBackLinkTop({
        ...props,
        expectedUrl: `templates/message-templates`,
      });
    });

    test('when user clicks "Edit template", then the "Edit NHS App message template" page is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewPage = new TemplateMgmtPreviewNhsAppPage(page).setPathParam(
        'templateId',
        templates.valid.id
      );

      await previewPage.loadPage();

      await previewPage.editButton.click();

      await expect(page).toHaveURL(
        `${baseURL}/templates/edit-nhs-app-template/${templates.valid.id}`
      );
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with missing data, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewPage = new TemplateMgmtPreviewNhsAppPage(page).setPathParam(
        'templateId',
        templates.empty.id
      );

      await previewPage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewPage = new TemplateMgmtPreviewNhsAppPage(page).setPathParam(
        'templateId',
        'fake-template-id'
      );

      await previewPage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });
  });

  // This whole suite can removed once routing is permanently enabled.
  test.describe('Routing disabled', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('when user visits page, then page is loaded', async ({
      page,
      baseURL,
    }) => {
      await loginAsUser(routingDisabledUser, page);

      const previewPage = new TemplateMgmtPreviewNhsAppPage(page).setPathParam(
        'templateId',
        templates.routingDisabled.id
      );

      await previewPage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/preview-nhs-app-template/${templates.routingDisabled.id}`
      );

      await expect(previewPage.editRadioOption).not.toBeChecked();

      await expect(previewPage.submitRadioOption).not.toBeChecked();

      await expect(previewPage.pageHeading).toContainText(
        templates.routingDisabled.name
      );

      await expect(previewPage.messageText).toHaveText('test-template-message');
    });

    test.describe('Page functionality', () => {
      test('when user submits form with "Edit" data, then the "Create NHS App message template" page is displayed', async ({
        baseURL,
        page,
      }) => {
        await loginAsUser(routingDisabledUser, page);

        const previewPage = new TemplateMgmtPreviewNhsAppPage(
          page
        ).setPathParam('templateId', templates.routingDisabled.id);

        await previewPage.loadPage();

        await previewPage.editRadioOption.click();

        await previewPage.clickContinueButton();

        await expect(page).toHaveURL(
          `${baseURL}/templates/edit-nhs-app-template/${templates.routingDisabled.id}`
        );
      });

      test('when user submits form with "Submit" data, then the "Are you sure you want to submit" page is displayed', async ({
        baseURL,
        page,
      }) => {
        await loginAsUser(routingDisabledUser, page);

        const previewPage = new TemplateMgmtPreviewNhsAppPage(
          page
        ).setPathParam('templateId', templates.routingDisabled.id);

        await previewPage.loadPage();

        await previewPage.submitRadioOption.click();

        await previewPage.clickContinueButton();

        await expect(page).toHaveURL(
          `${baseURL}/templates/submit-nhs-app-template/${templates.routingDisabled.id}?lockNumber=${templates.routingDisabled.lockNumber}`
        );
      });
    });

    test.describe('Error handling', () => {
      test('when user submits page with no data, then an error is displayed', async ({
        page,
      }) => {
        await loginAsUser(routingDisabledUser, page);

        const errorMessage = 'Select an option';

        const previewPage = new TemplateMgmtPreviewNhsAppPage(
          page
        ).setPathParam('templateId', templates.routingDisabled.id);

        await previewPage.loadPage();

        await previewPage.clickContinueButton();

        await expect(previewPage.errorSummary).toBeVisible();

        const selectOptionErrorLink = previewPage.errorSummary.locator(
          '[href="#previewNHSAppTemplateAction"]'
        );

        await expect(selectOptionErrorLink).toHaveText(errorMessage);

        await selectOptionErrorLink.click();

        await expect(
          page.locator('#previewNHSAppTemplateAction')
        ).toBeInViewport();
      });
    });
  });
});
