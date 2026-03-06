import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
import { TestUser, testUsers } from 'helpers/auth/cognito-auth-helper';
import { getTestContext } from 'helpers/context/context';
import { loginAsUser } from 'helpers/auth/login-as-user';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';
import { TemplateFactory } from 'helpers/factories/template-factory';
import {
  assertAndClickBackLinkBottom,
  assertBackLinkTopNotPresent,
  assertFooterLinks,
  assertHeaderLogoLink,
  assertSignOutLink,
  assertSkipToMainContent,
} from 'helpers/template-mgmt-common.steps';
import { TemplateMgmtEditTemplateNamePage } from 'pages/letter/template-mgmt-edit-template-name-page';
import { TemplateMgmtPreviewLetterPage } from 'pages/letter/template-mgmt-preview-letter-page';

test.describe('Edit Template Name page', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  const templateStorageHelper = new TemplateStorageHelper();

  let user: TestUser;
  let userAuthoringDisabled: TestUser;

  test.beforeAll(async () => {
    const context = getTestContext();
    user = await context.auth.getTestUser(
      testUsers.UserLetterAuthoringEnabled.userId
    );
    userAuthoringDisabled = await context.auth.getTestUser(
      testUsers.User1.userId
    );
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test.describe('with letter authoring enabled', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsUser(user, page);
    });

    test('common page tests', async ({ page, baseURL }) => {
      const template = TemplateFactory.createAuthoringLetterTemplate(
        randomUUID(),
        user,
        'Letter Template'
      );

      await templateStorageHelper.seedTemplateData([template]);

      const props = {
        page: new TemplateMgmtEditTemplateNamePage(page)
          .setPathParam('templateId', template.id)
          .setSearchParam('lockNumber', String(template.lockNumber)),
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertHeaderLogoLink(props);
      await assertSignOutLink(props);
      await assertFooterLinks(props);
      await assertBackLinkTopNotPresent(props);
      await assertAndClickBackLinkBottom({
        ...props,
        expectedUrl: `templates/preview-letter-template/${template.id}`,
      });
    });

    test('updates the template name and redirects back to the preview page', async ({
      page,
    }) => {
      const template = TemplateFactory.createAuthoringLetterTemplate(
        randomUUID(),
        user,
        'Letter Template'
      );

      await templateStorageHelper.seedTemplateData([template]);

      const editPage = new TemplateMgmtEditTemplateNamePage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await editPage.loadPage();

      await expect(editPage.nameInput).toHaveValue(template.name);

      await editPage.nameInput.fill('New Template Name');
      await editPage.submitButton.click();

      await expect(page).toHaveURL(
        `/templates/preview-letter-template/${template.id}`
      );

      const previewPage = new TemplateMgmtPreviewLetterPage(page);

      await expect(previewPage.pageHeading).toHaveText('New Template Name');
    });

    test('shows error when submitting an empty form', async ({ page }) => {
      const template = TemplateFactory.createAuthoringLetterTemplate(
        randomUUID(),
        user,
        'Letter Template'
      );

      await templateStorageHelper.seedTemplateData([template]);

      const editPage = new TemplateMgmtEditTemplateNamePage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await editPage.loadPage();

      await expect(editPage.errorSummary).toBeHidden();

      await editPage.nameInput.fill('');

      await editPage.submitButton.click();

      await expect(page).toHaveURL(
        `/templates/edit-template-name/${template.id}?lockNumber=${template.lockNumber}`
      );

      await expect(editPage.errorSummaryList).toHaveText([
        'Enter a template name',
      ]);
    });

    test("redirects to invalid template page if template doesn't exist", async ({
      page,
    }) => {
      const editPage = new TemplateMgmtEditTemplateNamePage(page)
        .setPathParam('templateId', 'no-exist')
        .setSearchParam('lockNumber', '1');

      await editPage.loadPage();

      await expect(page).toHaveURL('/templates/invalid-template');
    });

    test('redirects to template list page if template type is NHS_APP', async ({
      page,
    }) => {
      const template = TemplateFactory.createNhsAppTemplate(randomUUID(), user);

      await templateStorageHelper.seedTemplateData([template]);

      const editPage = new TemplateMgmtEditTemplateNamePage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await editPage.loadPage();

      await expect(page).toHaveURL('/templates/message-templates');
    });

    test('redirects to template list page if template type is EMAIL', async ({
      page,
    }) => {
      const template = TemplateFactory.createEmailTemplate(randomUUID(), user);

      await templateStorageHelper.seedTemplateData([template]);

      const editPage = new TemplateMgmtEditTemplateNamePage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await editPage.loadPage();

      await expect(page).toHaveURL('/templates/message-templates');
    });

    test('redirects to template list page if template type is SMS', async ({
      page,
    }) => {
      const template = TemplateFactory.createSmsTemplate(randomUUID(), user);

      await templateStorageHelper.seedTemplateData([template]);

      const editPage = new TemplateMgmtEditTemplateNamePage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await editPage.loadPage();

      await expect(page).toHaveURL('/templates/message-templates');
    });

    test('redirects to template preview page if template is a PDF letter', async ({
      page,
    }) => {
      const template = TemplateFactory.uploadLetterTemplate(
        randomUUID(),
        user,
        'PDF Letter Template'
      );

      await templateStorageHelper.seedTemplateData([template]);

      const editPage = new TemplateMgmtEditTemplateNamePage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await editPage.loadPage();

      await expect(page).toHaveURL(
        `/templates/preview-letter-template/${template.id}`
      );
    });

    test('redirects to preview submitted template page if template is submitted', async ({
      page,
    }) => {
      const template = TemplateFactory.createAuthoringLetterTemplate(
        randomUUID(),
        user,
        'Letter Template',
        'SUBMITTED'
      );

      await templateStorageHelper.seedTemplateData([template]);

      const editPage = new TemplateMgmtEditTemplateNamePage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await editPage.loadPage();

      await expect(page).toHaveURL(
        `/templates/preview-submitted-letter-template/${template.id}`
      );
    });

    test('redirects to preview page when lockNumber query parameter is missing', async ({
      page,
    }) => {
      const template = TemplateFactory.createAuthoringLetterTemplate(
        randomUUID(),
        user,
        'Letter Template'
      );

      await templateStorageHelper.seedTemplateData([template]);

      const editPage = new TemplateMgmtEditTemplateNamePage(page).setPathParam(
        'templateId',
        template.id
      );

      await editPage.loadPage();

      await expect(page).toHaveURL(
        `/templates/preview-letter-template/${template.id}`
      );
    });
  });

  test.describe('with letter authoring disabled', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsUser(userAuthoringDisabled, page);
    });

    test('redirects to template list page', async ({ page }) => {
      const template = TemplateFactory.createAuthoringLetterTemplate(
        randomUUID(),
        userAuthoringDisabled,
        'Letter Template'
      );

      await templateStorageHelper.seedTemplateData([template]);

      const editPage = new TemplateMgmtEditTemplateNamePage(page)
        .setPathParam('templateId', template.id)
        .setSearchParam('lockNumber', String(template.lockNumber));

      await editPage.loadPage();

      await expect(page).toHaveURL('/templates/message-templates');
    });
  });
});
