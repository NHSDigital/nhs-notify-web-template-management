import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import { Template } from '../../helpers/types';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertBackLinkTopNotPresent,
  assertAndClickBackLinkBottom,
} from '../../helpers/template-mgmt-common.steps';
import { TestUser, testUsers } from '../../helpers/auth/cognito-auth-helper';
import { getTestContext } from '../../helpers/context/context';
import { loginAsUser } from 'helpers/auth/login-as-user';
import { TemplateMgmtSubmitLetterPage } from '../../pages/letter/template-mgmt-submit-letter-page';
import { TemplateMgmtMessageTemplatesPage } from 'pages/template-mgmt-message-templates-page';

// clear login state from e2e.setup.ts
test.use({ storageState: { cookies: [], origins: [] } });

let routingEnabledUser: TestUser;
let routingDisabledProofingEnabledUser: TestUser;
let proofingDisabledUser: TestUser;

async function createTemplates() {
  const context = getTestContext();
  routingEnabledUser = await context.auth.getTestUser(testUsers.User1.userId);
  routingDisabledProofingEnabledUser = await context.auth.getTestUser(
    testUsers.User2.userId
  );
  proofingDisabledUser = await context.auth.getTestUser(testUsers.User3.userId);

  return {
    empty: {
      id: 'submit-letter-page-invalid-template',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateType: 'LETTER',
      templateStatus: 'NOT_YET_SUBMITTED',
      owner: `CLIENT#${routingEnabledUser.clientId}`,
      letterVersion: 'PDF',
    } as Template,

    routingEnabled: TemplateFactory.uploadLetterTemplate(
      '71f93ddb-d949-438c-af28-127abfc15f24',
      routingEnabledUser,
      'routing-enabled-submit-letter',
      'PROOF_AVAILABLE'
    ),

    routingDisabled: TemplateFactory.uploadLetterTemplate(
      'b9321307-abfe-48d1-a10a-1d7fe21bd18c',
      routingDisabledProofingEnabledUser,
      'routing-disabled-submit-letter',
      'PROOF_AVAILABLE'
    ),

    proofingDisabled: TemplateFactory.uploadLetterTemplate(
      '900a8ee3-50e4-49a8-b157-a179f1905f4b',
      proofingDisabledUser,
      'proofing-disabled-submit-letter',
      'NOT_YET_SUBMITTED'
    ),

    authoring: TemplateFactory.createAuthoringLetterTemplate(
      'c1234567-abcd-1234-abcd-123456789abc',
      routingEnabledUser,
      'authoring-submit-letter',
      'NOT_YET_SUBMITTED'
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

  test('when routing is enabled and user submits form, then the "message templates" page is displayed', async ({
    page,
    baseURL,
  }) => {
    await loginAsUser(routingEnabledUser, page);

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

    await expect(submitPage.submitButton).toHaveText('Approve template proof');

    await submitPage.clickSubmitTemplateButton();

    const listPage = new TemplateMgmtMessageTemplatesPage(page);

    await expect(page).toHaveURL(listPage.getUrl());

    const status = await listPage.getTemplateStatus(
      templates.routingEnabled.id
    );

    expect(status).toBe('Proof approved');
  });

  test('when routing is disabled and user submits form, then the "letter-template-submitted" page is displayed', async ({
    page,
    baseURL,
  }) => {
    await loginAsUser(routingDisabledProofingEnabledUser, page);

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

    await expect(submitPage.submitButton).toHaveText('Approve and submit');

    await submitPage.clickSubmitTemplateButton();

    await expect(page).toHaveURL(
      `/templates/letter-template-submitted/${templates.routingDisabled.id}`
    );
  });

  test('when proofing is disabled and user submits form, then the "letter-template-submitted" page is displayed', async ({
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

    await expect(submitPage.submitButton).toHaveText('Submit template');

    await submitPage.clickSubmitTemplateButton();

    await expect(page).toHaveURL(
      `/templates/letter-template-submitted/${templates.proofingDisabled.id}`
    );
  });

  test.describe('Error handling', () => {
    test('when user visits page with missing data, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      await loginAsUser(routingEnabledUser, page);

      const submitPage = new TemplateMgmtSubmitLetterPage(page)
        .setPathParam('templateId', templates.empty.id)
        .setSearchParam('lockNumber', String(templates.empty.lockNumber));

      await submitPage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a non-existent template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      await loginAsUser(routingEnabledUser, page);

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
      await loginAsUser(routingEnabledUser, page);

      const submitPage = new TemplateMgmtSubmitLetterPage(page).setPathParam(
        'templateId',
        templates.routingEnabled.id
      );

      await submitPage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/preview-letter-template/${templates.routingEnabled.id}`
      );
    });

    test('when user visits page with an AUTHORING letter template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      await loginAsUser(routingEnabledUser, page);

      const submitPage = new TemplateMgmtSubmitLetterPage(page)
        .setPathParam('templateId', templates.authoring.id)
        .setSearchParam('lockNumber', String(templates.authoring.lockNumber));

      await submitPage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });
  });

  test('common page tests', async ({ page, baseURL }) => {
    await loginAsUser(routingEnabledUser, page);

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
    await assertBackLinkTopNotPresent(props);
    await assertAndClickBackLinkBottom({
      ...props,
      expectedUrl: `templates/preview-letter-template/${templates.routingEnabled.id}`,
    });
  });
});
