import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateMgmtPreviewSubmittedLetterPage } from '../../pages/letter/template-mgmt-preview-submitted-letter-page';
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
  const validBase = TemplateFactory.uploadLetterTemplate(
    '0b5f3591-8a36-4b33-9873-3c4842db4351',
    user,
    'valid-letter-template-preview-submitted',
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

  const authoringValid = TemplateFactory.createAuthoringLetterTemplate(
    'e8b5f3a1-2c4d-4e6f-8a9b-1c2d3e4f5a6b',
    user,
    'authoring-letter-template-preview-submitted',
    'SUBMITTED'
  );

  return {
    valid,
    authoringValid,
    invalid: {
      ...TemplateFactory.uploadLetterTemplate(
        '621456cf-ace3-49c3-941e-4df5eba11373',
        user,
        'invalid-letter-template-preview-submitted',
        'NOT_A_STATUS'
      ),
    },
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

  test('when user visits page, then page is loaded', async ({
    page,
    baseURL,
  }) => {
    const previewSubmittedLetterTemplatePage =
      new TemplateMgmtPreviewSubmittedLetterPage(page).setPathParam(
        'templateId',
        templates.valid.id
      );

    await previewSubmittedLetterTemplatePage.loadPage();

    await expect(page).toHaveURL(
      `${baseURL}/templates/preview-submitted-letter-template/${templates.valid.id}`
    );

    await expect(previewSubmittedLetterTemplatePage.pageHeading).toContainText(
      templates.valid.name
    );

    expect(templates.valid.campaignId).toBeTruthy();

    await expect(previewSubmittedLetterTemplatePage.campaignId).toContainText(
      templates.valid.campaignId!
    );

    await expect(previewSubmittedLetterTemplatePage.statusTag).toHaveText(
      'Submitted'
    );

    await expect(previewSubmittedLetterTemplatePage.copyLink).toHaveCount(0);
  });

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtPreviewSubmittedLetterPage(page).setPathParam(
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
    const cases = [
      {
        title: 'an invalid pdf template',
        getTemplateId: () => templates.invalid.id,
      },
      {
        title: 'a valid authoring template',
        getTemplateId: () => templates.authoringValid.id,
      },
      {
        title: 'a nonexistent template',
        getTemplateId: () => 'nonexistent-template-id',
      },
    ];

    for (const { getTemplateId, title } of cases) {
      test(`when user visits page with id of ${title}, then it redirects to the invalid template page`, async ({
        baseURL,
        page,
      }) => {
        const previewSubmittedLetterTemplatePage =
          new TemplateMgmtPreviewSubmittedLetterPage(page).setPathParam(
            'templateId',
            getTemplateId()
          );

        await previewSubmittedLetterTemplatePage.loadPage();

        await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
      });
    }
  });
});
