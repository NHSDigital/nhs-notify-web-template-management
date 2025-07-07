import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateMgmtPreviewSubmittedLetterPage } from '../../pages/letter/template-mgmt-preview-submitted-letter-page';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import { Template } from '../../helpers/types';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertNotifyBannerLink,
  assertSkipToMainContent,
} from '../template-mgmt-common.steps';
import {
  assertBackToAllTemplatesBottomLink,
  assertBackToAllTemplatesTopLink,
} from '../template-mgmt-preview-submitted-common.steps';
import {
  createAuthHelper,
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';

function createTemplates(owner: string) {
  const validBase = TemplateFactory.createLetterTemplate(
    'valid-letter-template-preview-submitted',
    owner,
    'valid-email-template-preview-submitted',
    'SUBMITTED'
  );

  const valid: Template = {
    ...validBase,
    files: {
      ...validBase.files,
      proofs: {
        'first.pdf': {
          virusScanStatus: 'PASSED',
          supplier: 'WTMMOCK',
          fileName: 'first.pdf',
        },
      },
    },
  };

  return {
    valid,
    invalid: {
      ...TemplateFactory.createLetterTemplate(
        'invalid-letter-template-preview-submitted',
        owner,
        'invalid-letter-template-preview-submitted',
        'NOT_A_STATUS'
      ),
    },
  };
}

test.describe('Preview submitted Letter message template Page', () => {
  let templates: Record<string, Template>;
  const templateStorageHelper = new TemplateStorageHelper();

  test.beforeAll(async () => {
    const user = await createAuthHelper().getTestUser(testUsers.User1.userId);
    templates = createTemplates(user.userId);
    await templateStorageHelper.seedTemplateData(Object.values(templates));
  });

  test.afterAll(async () => {
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('when user visits page, then page is loaded', async ({
    page,
    baseURL,
  }) => {
    const previewSubmittedLetterTemplatePage =
      new TemplateMgmtPreviewSubmittedLetterPage(page);

    await previewSubmittedLetterTemplatePage.loadPage(templates.valid.id);

    await expect(page).toHaveURL(
      `${baseURL}/templates/preview-submitted-letter-template/${templates.valid.id}`
    );

    await expect(previewSubmittedLetterTemplatePage.pageHeader).toContainText(
      templates.valid.name
    );
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtPreviewSubmittedLetterPage(page),
        id: templates.valid.id,
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertNotifyBannerLink(props);
      await assertSignOutLink(props);
      await assertFooterLinks(props);
      await assertBackToAllTemplatesTopLink(props);
      await assertBackToAllTemplatesBottomLink(props);
    });
  });

  test.describe('Error handling', () => {
    test('when user visits page with an unsubmitted template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewSubmittedLetterTemplatePage =
        new TemplateMgmtPreviewSubmittedLetterPage(page);

      await previewSubmittedLetterTemplatePage.loadPage(templates.invalid.id);

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewSubmittedLetterTemplatePage =
        new TemplateMgmtPreviewSubmittedLetterPage(page);

      await previewSubmittedLetterTemplatePage.loadPage('/fake-template-id');

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });
  });
});
