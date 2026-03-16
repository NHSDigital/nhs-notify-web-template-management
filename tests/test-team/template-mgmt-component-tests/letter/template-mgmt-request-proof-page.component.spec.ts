import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import { testUsers } from '../../helpers/auth/cognito-auth-helper';
import { getTestContext } from '../../helpers/context/context';
import { TemplateMgmtRequestProofPage } from '../../pages/template-mgmt-request-proof-page';
import { TemplateMgmtPreviewLetterPage } from 'pages/letter/template-mgmt-preview-letter-page';

async function createTemplates() {
  const user = await getTestContext().auth.getTestUser(testUsers.User1.userId);
  return {
    valid: TemplateFactory.uploadLetterTemplate(
      'AC85D9AB-9B56-4C34-8CD7-8B713310A37A',
      user,
      'request-proof'
    ),
    authoring: TemplateFactory.createAuthoringLetterTemplate(
      'AC85D9AB-9B56-4C34-8CD7-8B713310A37B',
      user,
      'authoring-request-proof'
    ),
  };
}

test.describe('Request Proof Page', () => {
  let templates: Awaited<ReturnType<typeof createTemplates>>;

  const templateStorageHelper = new TemplateStorageHelper();

  test.beforeAll(async () => {
    templates = await createTemplates();
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('when user visits page, then page is loaded, request proof button is visible', async ({
    page,
  }) => {
    const requestProofPage = new TemplateMgmtRequestProofPage(page)
      .setPathParam('templateId', templates.valid.id)
      .setSearchParam('lockNumber', String(templates.valid.lockNumber));

    await requestProofPage.loadPage();

    await expect(page).toHaveURL(requestProofPage.getUrl());

    await expect(requestProofPage.pageHeading).toContainText(
      templates.valid.name
    );

    await expect(requestProofPage.requestProofButton).toBeVisible();
  });

  test('redirects to the letter template preview page if the lockNumber query parameter is not set', async ({
    page,
  }) => {
    const requestProofPage = new TemplateMgmtRequestProofPage(
      page
    ).setPathParam('templateId', templates.valid.id);

    const previewPage = new TemplateMgmtPreviewLetterPage(page).setPathParam(
      'templateId',
      templates.valid.id
    );

    await requestProofPage.loadPage();

    await expect(page).toHaveURL(previewPage.getUrl());
  });

  test('redirects to invalid-template page when template has AUTHORING letterVersion', async ({
    page,
    baseURL,
  }) => {
    const requestProofPage = new TemplateMgmtRequestProofPage(page)
      .setPathParam('templateId', templates.authoring.id)
      .setSearchParam('lockNumber', String(templates.authoring.lockNumber));

    await requestProofPage.loadPage();

    await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
  });
});
