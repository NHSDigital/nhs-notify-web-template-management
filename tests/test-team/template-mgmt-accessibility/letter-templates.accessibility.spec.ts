import { randomUUID } from 'node:crypto';
import { test } from 'fixtures/accessibility-analyze';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from 'helpers/auth/cognito-auth-helper';
import { TemplateStorageHelper } from 'helpers/db/template-storage-helper';
import { TemplateFactory } from 'helpers/factories/template-factory';
import {
  TemplateMgmtEditTemplateCampaignPage,
  TemplateMgmtEditTemplateNamePage,
  TemplateMgmtPreviewLetterPage,
  TemplateMgmtPreviewSubmittedLetterPage,
  TemplateMgmtSubmitLetterPage,
  TemplateMgmtTemplateSubmittedLetterPage,
  TemplateMgmtUploadBSLLetterTemplatePage,
  TemplateMgmtUploadLargePrintLetterTemplatePage,
  TemplateMgmtUploadLetterMissingCampaignClientIdPage,
  TemplateMgmtUploadLetterPage,
  TemplateMgmtUploadOtherLanguageLetterTemplatePage,
  TemplateMgmtUploadStandardEnglishLetterTemplatePage,
} from 'pages/letter';
import { TemplateMgmtRequestProofPage } from 'pages/template-mgmt-request-proof-page';
import { loginAsUser } from 'helpers/auth/login-as-user';

const templateIds = {
  AUTHORING: randomUUID(),
  LETTER: randomUUID(),
  LETTER_ERROR: randomUUID(),
  LETTER_SUBMITTED: randomUUID(),
};
let authoringUser: TestUser;

beforeAll(async () => {
  const authHelper = createAuthHelper();

  authoringUser = await authHelper.getTestUser(
    testUsers.ClientLetterAuthoringEnabled.userId
  );

  const authoring = TemplateFactory.createAuthoringLetterTemplate(
    templateIds.AUTHORING,
    authoringUser,
    `Authoring letter template - ${templateIds.AUTHORING}`
  );

  const letter = TemplateFactory.uploadLetterTemplate(
    templateIds.LETTER,
    authoringUser,
    `Proofing letter template - ${templateIds.LETTER}`
  );

  const letterWithError = TemplateFactory.uploadLetterTemplate(
    templateIds.LETTER_ERROR,
    authoringUser,
    `Proofing error letter template - ${templateIds.LETTER_ERROR}`,
    'VALIDATION_FAILED'
  );

  const letterSubmitted = TemplateFactory.uploadLetterTemplate(
    templateIds.LETTER_ERROR,
    authoringUser,
    `Proofing error letter template - ${templateIds.LETTER_ERROR}`,
    'SUBMITTED'
  );

  await new TemplateStorageHelper().seedTemplateData([
    authoring,
    letter,
    letterWithError,
    letterSubmitted,
  ]);
});

test('Upload letter template', async ({ page, analyze }) =>
  analyze(new TemplateMgmtUploadLetterPage(page)));

test('Upload letter template error', async ({ page, analyze }) =>
  analyze(new TemplateMgmtUploadLetterPage(page), {
    beforeAnalyze: async (p) => p.clickSaveAndPreviewButton(),
  }));

test('Preview letter template', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtPreviewLetterPage(page).setPathParam(
      'templateId',
      templateIds.LETTER
    )
  ));

test('Preview letter template error', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtPreviewLetterPage(page).setPathParam(
      'templateId',
      templateIds.LETTER_ERROR
    ),
    {
      beforeAnalyze: async (p) => {
        await p.errorSummary.isVisible();
      },
    }
  ));

test('Submit letter template', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtSubmitLetterPage(page).setPathParam(
      'templateId',
      templateIds.LETTER
    )
  ));

test('Letter template submitted', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtTemplateSubmittedLetterPage(page).setPathParam(
      'templateId',
      templateIds.LETTER_SUBMITTED
    )
  ));

test('Preview submitted letter template', async ({ page, analyze }) =>
  analyze(
    new TemplateMgmtPreviewSubmittedLetterPage(page).setPathParam(
      'templateId',
      templateIds.LETTER_SUBMITTED
    )
  ));

test('Client id and Campaign Id required', async ({ page, analyze }) =>
  analyze(new TemplateMgmtUploadLetterMissingCampaignClientIdPage(page)));

test.describe('Letter authoring', () => {
  test.beforeAll(async ({ page }) => {
    test.use({ storageState: { cookies: [], origins: [] } });

    await loginAsUser(authoringUser, page);
  });

  test('Upload British Sign Language letter', async ({ page, analyze }) =>
    analyze(new TemplateMgmtUploadBSLLetterTemplatePage(page)));

  test('Upload Large print letter', async ({ page, analyze }) =>
    analyze(new TemplateMgmtUploadLargePrintLetterTemplatePage(page)));

  test('Upload Other language letter', async ({ page, analyze }) =>
    analyze(new TemplateMgmtUploadOtherLanguageLetterTemplatePage(page)));

  test('Upload Standard English letter', async ({ page, analyze }) =>
    analyze(new TemplateMgmtUploadStandardEnglishLetterTemplatePage(page)));

  test('Edit template campaign', async ({ page, analyze }) =>
    analyze(
      new TemplateMgmtEditTemplateCampaignPage(page).setPathParam(
        'templateId',
        templateIds.AUTHORING
      )
    ));

  test('Edit template campaign error', async ({ page, analyze }) =>
    analyze(
      new TemplateMgmtEditTemplateCampaignPage(page).setPathParam(
        'templateId',
        templateIds.AUTHORING
      ),
      {
        beforeAnalyze: async (p) => {
          await p.campaignSelect.selectOption('');
          await p.submitButton.click();
          await p.errorSummary.isVisible();
        },
      }
    ));

  test('Edit template name', async ({ page, analyze }) =>
    analyze(
      new TemplateMgmtEditTemplateNamePage(page).setPathParam(
        'templateId',
        templateIds.AUTHORING
      )
    ));

  test('Edit template name error', async ({ page, analyze }) =>
    analyze(
      new TemplateMgmtEditTemplateNamePage(page).setPathParam(
        'templateId',
        templateIds.AUTHORING
      ),
      {
        beforeAnalyze: async (p) => {
          await p.nameInput.fill('');
          await p.submitButton.click();
          await p.errorSummary.isVisible();
        },
      }
    ));
});
