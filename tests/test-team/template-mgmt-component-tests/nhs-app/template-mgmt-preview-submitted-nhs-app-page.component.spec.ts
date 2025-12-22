import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateMgmtPreviewSubmittedNhsAppPage } from '../../pages/nhs-app/template-mgmt-preview-submitted-nhs-app-page';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import { Template } from '../../helpers/types';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertBackLinkBottom,
  assertAndClickBackLinkTop,
} from '../../helpers/template-mgmt-common.steps';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';

function createTemplates(user: TestUser) {
  return {
    valid: {
      ...TemplateFactory.createNhsAppTemplate(
        '298799c4-bc2c-49b6-b9cc-74e7750261d2',
        user,
        'valid-nhs-app-template-preview-submitted'
      ),
      message: 'test-template-message',
      templateStatus: 'SUBMITTED',
    },
    invalid: {
      ...TemplateFactory.createNhsAppTemplate(
        'a0a0d4c9-e18d-4aa9-8973-336a66fbadde',
        user,
        'invalid-nhs-app-template-preview-submitted'
      ),
      message: 'test-template-message',
      templateStatus: 'NOT_YET_SUBMITTED',
    },
  };
}

test.describe('Preview submitted NHS App message template Page', () => {
  let templates: Record<string, Template>;

  const templateStorageHelper = new TemplateStorageHelper();

  test.beforeAll(async () => {
    const user = await createAuthHelper().getTestUser(testUsers.User1.userId);
    templates = createTemplates(user);
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('when user visits page, then page is loaded', async ({
    page,
    baseURL,
  }) => {
    const previewSubmittedNHSAppTemplatePage =
      new TemplateMgmtPreviewSubmittedNhsAppPage(page).setPathParam(
        'templateId',
        templates.valid.id
      );

    await previewSubmittedNHSAppTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/preview-submitted-nhs-app-template/${templates.valid.id}`
    );

    await expect(previewSubmittedNHSAppTemplatePage.pageHeading).toContainText(
      templates.valid.name
    );

    await expect(previewSubmittedNHSAppTemplatePage.messageText).toHaveText(
      'test-template-message'
    );

    await expect(previewSubmittedNHSAppTemplatePage.statusTag).toHaveText(
      'Locked'
    );

    await expect(previewSubmittedNHSAppTemplatePage.copyLink).toHaveAttribute(
      'href',
      `/copy-template/${templates.valid.id}`
    );
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtPreviewSubmittedNhsAppPage(page).setPathParam(
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
  });

  test.describe('Error handling', () => {
    test('when user visits page with an unsubmitted template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewSubmittedNHSAppTemplatePage =
        new TemplateMgmtPreviewSubmittedNhsAppPage(page).setPathParam(
          'templateId',
          templates.invalid.id
        );

      await previewSubmittedNHSAppTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewSubmittedNHSAppTemplatePage =
        new TemplateMgmtPreviewSubmittedNhsAppPage(page).setPathParam(
          'templateId',
          'fake-template-id'
        );

      await previewSubmittedNHSAppTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });
  });
});
