import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import { Template } from '../../helpers/types';
import {
  createAuthHelper,
  TestUserId,
} from '../../helpers/auth/cognito-auth-helper';
import { TemplateMgmtPreviewLetterPage } from '../../pages/letter/template-mgmt-preview-letter-page';
import { TemplateMgmtSubmitLetterPage } from '../../pages/letter/template-mgmt-submit-letter-page';
import { TemplateMgmtRequestProofPage } from '../../pages/template-mgmt-request-proof-page';

async function createTemplates() {
  const user = await createAuthHelper().getTestUser(TestUserId.User1);
  return {
    valid: TemplateFactory.createLetterTemplate(
      'letter-request-proof-template',
      user.userId,
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

  test('when user visits page, then page is loaded, can click to go to submit page', async ({
    page,
    baseURL,
  }) => {
    const requestProofPage = new TemplateMgmtRequestProofPage(page);

    await requestProofPage.loadPage(templates.valid.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/${TemplateMgmtRequestProofPage.pageUrlSegment}/${templates.valid.id}`
    );

    await expect(requestProofPage.pageHeader).toContainText(
      templates.valid.name
    );

    await expect(requestProofPage.requestProofButton).toBeVisible();
  });
});
