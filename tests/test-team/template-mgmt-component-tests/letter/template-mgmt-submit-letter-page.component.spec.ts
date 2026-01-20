import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import { Template } from '../../helpers/types';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertBackLinkBottom,
  assertBackLinkTopNotPresent,
} from '../../helpers/template-mgmt-common.steps';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';
import { loginAsUser } from 'helpers/auth/login-as-user';
import { TemplateMgmtSubmitLetterPage } from '../../pages/letter/template-mgmt-submit-letter-page';

let routingDisabledUser: TestUser;
let proofingDisabledUser: TestUser;

async function createTemplates() {
  const authHelper = createAuthHelper();
  const user = await authHelper.getTestUser(testUsers.User1.userId);
  // User2 has Client5: proofing=true, routing=false
  routingDisabledUser = await authHelper.getTestUser(testUsers.User2.userId);
  // User3 has Client2: proofing=false, routing=false
  proofingDisabledUser = await authHelper.getTestUser(testUsers.User3.userId);

  return {
    empty: {
      id: 'submit-letter-page-invalid-template',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateType: 'LETTER',
      templateStatus: 'NOT_YET_SUBMITTED',
      owner: `CLIENT#${user.clientId}`,
    } as Template,
    // User1 template: proofing=true, routing=true -> "Approve" heading
    routingEnabled: TemplateFactory.uploadLetterTemplate(
      'E3F4D5C6-B7A8-9012-3456-789012345678',
      user,
      'routing-enabled-submit-letter'
    ),
    // Additional template for submit action test (User1)
    routingEnabledSubmit: TemplateFactory.uploadLetterTemplate(
      'A1B2C3D4-E5F6-7890-1234-567890123456',
      user,
      'routing-enabled-submit-action-letter'
    ),
    // User2 template: proofing=true, routing=false -> "Approve and submit" heading
    routingDisabled: TemplateFactory.uploadLetterTemplate(
      randomUUID(),
      routingDisabledUser,
      'routing-disabled-submit-letter'
    ),
    // Additional template for submit action test (User2)
    routingDisabledSubmit: TemplateFactory.uploadLetterTemplate(
      randomUUID(),
      routingDisabledUser,
      'routing-disabled-submit-action-letter'
    ),
    // User3 template: proofing=false, routing=false -> "Submit" heading
    proofingDisabled: TemplateFactory.uploadLetterTemplate(
      randomUUID(),
      proofingDisabledUser,
      'proofing-disabled-submit-letter'
    ),
    // Additional template for submit action test (User3)
    proofingDisabledSubmit: TemplateFactory.uploadLetterTemplate(
      randomUUID(),
      proofingDisabledUser,
      'proofing-disabled-submit-action-letter'
    ),
  };
}

test.describe('Submit Letter Template Page', () => {
  const templateStorageHelper = new TemplateStorageHelper();
  let templates: Awaited<ReturnType<typeof createTemplates>>;

  test.beforeAll(async () => {
    templates = await createTemplates();
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  // Default tests run with User1 (proofing=true, routing=true)
  test.describe('Proofing enabled, Routing enabled', () => {
    test('when user visits page, then page is loaded with "Approve" heading', async ({
      page,
      baseURL,
    }) => {
      const submitPage = new TemplateMgmtSubmitLetterPage(page)
        .setPathParam('templateId', templates.routingEnabled.id)
        .setSearchParam(
          'lockNumber',
          String(templates.routingEnabled.lockNumber)
        );

      await submitPage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/submit-letter-template/${templates.routingEnabled.id}?lockNumber=${templates.routingEnabled.lockNumber}`
      );

      await expect(submitPage.pageHeading).toHaveText(
        `Approve '${templates.routingEnabled.name}'`
      );
    });

    test('submit button has "Approve template proof" text', async ({
      page,
    }) => {
      const submitPage = new TemplateMgmtSubmitLetterPage(page)
        .setPathParam('templateId', templates.routingEnabled.id)
        .setSearchParam(
          'lockNumber',
          String(templates.routingEnabled.lockNumber)
        );

      await submitPage.loadPage();

      await expect(submitPage.submitButton).toHaveText(
        'Approve template proof'
      );
    });

    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtSubmitLetterPage(page)
          .setPathParam('templateId', templates.routingEnabled.id)
          .setSearchParam(
            'lockNumber',
            String(templates.routingEnabled.lockNumber)
          ),
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertHeaderLogoLink(props);
      await assertSignOutLink(props);
      await assertFooterLinks(props);
      await assertBackLinkBottom({
        ...props,
        expectedUrl: `templates/preview-letter-template/${templates.routingEnabled.id}`,
      });
      await assertBackLinkTopNotPresent(props);
    });

    test('when user submits form, then the "Template submitted" page is displayed', async ({
      page,
    }) => {
      const submitPage = new TemplateMgmtSubmitLetterPage(page)
        .setPathParam('templateId', templates.routingEnabledSubmit.id)
        .setSearchParam(
          'lockNumber',
          String(templates.routingEnabledSubmit.lockNumber)
        );

      await submitPage.loadPage();

      await submitPage.clickSubmitTemplateButton();

      await expect(page).toHaveURL(
        /\/templates\/letter-template-submitted\/(.*)/ // eslint-disable-line security/detect-non-literal-regexp
      );
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with missing data, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const submitPage = new TemplateMgmtSubmitLetterPage(page)
        .setPathParam('templateId', templates.empty.id)
        .setSearchParam('lockNumber', String(templates.empty.lockNumber));

      await submitPage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const submitPage = new TemplateMgmtSubmitLetterPage(page)
        .setPathParam('templateId', 'fake-template-id')
        .setSearchParam('lockNumber', '1');

      await submitPage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page without a lock number, redirect to the preview page', async ({
      baseURL,
      page,
    }) => {
      const submitPage = new TemplateMgmtSubmitLetterPage(page).setPathParam(
        'templateId',
        templates.routingEnabled.id
      );

      await submitPage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/preview-letter-template/${templates.routingEnabled.id}`
      );
    });
  });

  // Tests for User2 (proofing=true, routing=false)
  test.describe('Proofing enabled, Routing disabled', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('when user visits page, then page is loaded with "Approve and submit" heading', async ({
      page,
      baseURL,
    }) => {
      await loginAsUser(routingDisabledUser, page);

      const submitPage = new TemplateMgmtSubmitLetterPage(page)
        .setPathParam('templateId', templates.routingDisabled.id)
        .setSearchParam(
          'lockNumber',
          String(templates.routingDisabled.lockNumber)
        );

      await submitPage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/submit-letter-template/${templates.routingDisabled.id}?lockNumber=${templates.routingDisabled.lockNumber}`
      );

      await expect(submitPage.pageHeading).toHaveText(
        `Approve and submit '${templates.routingDisabled.name}'`
      );
    });

    test('submit button has "Approve and submit" text', async ({ page }) => {
      await loginAsUser(routingDisabledUser, page);

      const submitPage = new TemplateMgmtSubmitLetterPage(page)
        .setPathParam('templateId', templates.routingDisabled.id)
        .setSearchParam(
          'lockNumber',
          String(templates.routingDisabled.lockNumber)
        );

      await submitPage.loadPage();

      await expect(submitPage.submitButton).toHaveText('Approve and submit');
    });

    test('when user submits form, then the "Template submitted" page is displayed', async ({
      page,
    }) => {
      await loginAsUser(routingDisabledUser, page);

      const submitPage = new TemplateMgmtSubmitLetterPage(page)
        .setPathParam('templateId', templates.routingDisabledSubmit.id)
        .setSearchParam(
          'lockNumber',
          String(templates.routingDisabledSubmit.lockNumber)
        );

      await submitPage.loadPage();

      await submitPage.clickSubmitTemplateButton();

      await expect(page).toHaveURL(
        /\/templates\/letter-template-submitted\/(.*)/ // eslint-disable-line security/detect-non-literal-regexp
      );
    });
  });

  // Tests for User3 (proofing=false, routing=false)
  test.describe('Proofing disabled', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('when user visits page, then page is loaded with "Submit" heading', async ({
      page,
      baseURL,
    }) => {
      await loginAsUser(proofingDisabledUser, page);

      const submitPage = new TemplateMgmtSubmitLetterPage(page)
        .setPathParam('templateId', templates.proofingDisabled.id)
        .setSearchParam(
          'lockNumber',
          String(templates.proofingDisabled.lockNumber)
        );

      await submitPage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/submit-letter-template/${templates.proofingDisabled.id}?lockNumber=${templates.proofingDisabled.lockNumber}`
      );

      await expect(submitPage.pageHeading).toHaveText(
        `Submit '${templates.proofingDisabled.name}'`
      );
    });

    test('submit button has "Submit" text', async ({ page }) => {
      await loginAsUser(proofingDisabledUser, page);

      const submitPage = new TemplateMgmtSubmitLetterPage(page)
        .setPathParam('templateId', templates.proofingDisabled.id)
        .setSearchParam(
          'lockNumber',
          String(templates.proofingDisabled.lockNumber)
        );

      await submitPage.loadPage();

      await expect(submitPage.submitButton).toHaveText('Submit');
    });

    test('when user submits form, then the "Template submitted" page is displayed', async ({
      page,
    }) => {
      await loginAsUser(proofingDisabledUser, page);

      const submitPage = new TemplateMgmtSubmitLetterPage(page)
        .setPathParam('templateId', templates.proofingDisabledSubmit.id)
        .setSearchParam(
          'lockNumber',
          String(templates.proofingDisabledSubmit.lockNumber)
        );

      await submitPage.loadPage();

      await submitPage.clickSubmitTemplateButton();

      await expect(page).toHaveURL(
        /\/templates\/letter-template-submitted\/(.*)/ // eslint-disable-line security/detect-non-literal-regexp
      );
    });
  });
});
