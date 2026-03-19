import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateMgmtPreviewApprovedLetterPage } from '../../pages/letter/template-mgmt-preview-approved-letter-page';
import { TemplateFactory } from '../../helpers/factories/template-factory';
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
    valid: TemplateFactory.createAuthoringLetterTemplate(
      'e8b5f3a1-2c4d-4e6f-8a9b-1c2d3e4f5a6b',
      user,
      'authoring-letter-template-preview-approved-valid',
      'SUBMITTED'
    ),
    invalid: TemplateFactory.createAuthoringLetterTemplate(
      'e2a5b238-ecbf-42c8-90f1-0cf544a9c0ae',
      user,
      'authoring-letter-template-preview-approved-invalid',
      'NOT_A_STATUS'
    ),
  };
}

test.describe('Preview submitted Letter message template Page', () => {
  let templates: ReturnType<typeof createTemplates>;
  const templateStorageHelper = new TemplateStorageHelper();

  test.beforeAll(async () => {
    const user = await createAuthHelper().getTestUser(testUsers.User1.userId);
    templates = createTemplates(user);
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('when user visits page, then page is loaded with template details', async ({
    page,
    baseURL,
  }) => {
    const previewSubmittedLetterTemplatePage =
      new TemplateMgmtPreviewApprovedLetterPage(page).setPathParam(
        'templateId',
        templates.valid.id
      );

    await previewSubmittedLetterTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/preview-approved-letter-template/${templates.valid.id}`
    );

    await expect(previewSubmittedLetterTemplatePage.pageHeading).toContainText(
      templates.valid.name
    );

    expect(templates.valid.campaignId).toBeTruthy();

    await expect(previewSubmittedLetterTemplatePage.campaignId).toContainText(
      templates.valid.campaignId!
    );

    await expect(previewSubmittedLetterTemplatePage.statusTag).toHaveText(
      'Locked'
    );

    await expect(previewSubmittedLetterTemplatePage.copyLink).toHaveCount(0);
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtPreviewApprovedLetterPage(page).setPathParam(
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
      const previewSubmittedLetterTemplatePage =
        new TemplateMgmtPreviewApprovedLetterPage(page).setPathParam(
          'templateId',
          templates.invalid.id
        );

      await previewSubmittedLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewSubmittedLetterTemplatePage =
        new TemplateMgmtPreviewApprovedLetterPage(page).setPathParam(
          'templateId',
          'fake-template-id'
        );

      await previewSubmittedLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });
  });
});
