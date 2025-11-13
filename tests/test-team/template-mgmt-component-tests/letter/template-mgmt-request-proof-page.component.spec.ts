import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import {
  createAuthHelper,
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';
import { TemplateMgmtRequestProofPage } from '../../pages/template-mgmt-request-proof-page';

async function createTemplates() {
  const user = await createAuthHelper().getTestUser(testUsers.User1.userId);
  return {
    valid: TemplateFactory.uploadLetterTemplate(
      'AC85D9AB-9B56-4C34-8CD7-8B713310A37A',
      user,
      'request-proof'
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
    baseURL,
  }) => {
    const requestProofPage = new TemplateMgmtRequestProofPage(page);

    await requestProofPage.loadPage(templates.valid.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/${TemplateMgmtRequestProofPage.pageUrlSegments[0]}/${templates.valid.id}`
    );

    await expect(requestProofPage.pageHeading).toContainText(
      templates.valid.name
    );

    await expect(requestProofPage.requestProofButton).toBeVisible();
  });
});
