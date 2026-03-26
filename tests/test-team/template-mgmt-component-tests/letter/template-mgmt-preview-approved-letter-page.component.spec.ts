import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateMgmtPreviewApprovedLetterPage } from '../../pages/letter/template-mgmt-preview-approved-letter-page';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import {
  assertFooterLinks,
  assertSignOutLink,
  assertHeaderLogoLink,
  assertSkipToMainContent,
  assertAndClickBackLinkTop,
} from '../../helpers/template-mgmt-common.steps';
import {
  createAuthHelper,
  TestUser,
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';

function createTemplates(user: TestUser) {
  return {
    submitted: TemplateFactory.createAuthoringLetterTemplate(
      'e8b5f3a1-2c4d-4e6f-8a9b-1c2d3e4f5a6b',
      user,
      'authoring-letter-template-preview-approved-submitted',
      'SUBMITTED'
    ),
    proofApproved: TemplateFactory.createAuthoringLetterTemplate(
      '375f5dc4-7c77-48f5-be47-d3df1f52bc0e',
      user,
      'authoring-letter-template-preview-approved-proof-approved',
      'PROOF_APPROVED'
    ),
    invalid: TemplateFactory.createAuthoringLetterTemplate(
      'e2a5b238-ecbf-42c8-90f1-0cf544a9c0ae',
      user,
      'authoring-letter-template-preview-approved-invalid',
      'NOT_A_STATUS'
    ),
    pdf: TemplateFactory.uploadLetterTemplate(
      'ec8d9f84-35ef-454b-b7c4-233e0af8f764',
      user,
      'pdf-letter-template-submitted',
      'SUBMITTED'
    ),
    nhsapp: TemplateFactory.createNhsAppTemplate(
      '367e3846-e4da-4817-ba5d-722ef0187e53',
      user,
      'nhsapp-template-submitted',
      'SUBMITTED'
    ),
  };
}

test.describe('Preview approved letter template page', () => {
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

  test.describe('Page functionality', () => {
    test('common page tests', async ({ page, baseURL }) => {
      const props = {
        page: new TemplateMgmtPreviewApprovedLetterPage(page).setPathParam(
          'templateId',
          templates.submitted.id
        ),
        baseURL,
      };

      await assertSkipToMainContent(props);
      await assertHeaderLogoLink(props);
      await assertSignOutLink(props);
      await assertFooterLinks(props);
      await assertAndClickBackLinkTop({
        ...props,
        expectedUrl: `templates/message-templates`,
      });
    });

    for (const { getTemplate, templateStatus, expectedTag } of [
      {
        getTemplate: () => templates.submitted,
        templateStatus: 'SUBMITTED',
        expectedTag: 'Locked',
      },
      {
        getTemplate: () => templates.proofApproved,
        templateStatus: 'PROOF_APPROVED',
        expectedTag: 'Approved',
      },
    ]) {
      test(`when user visits page for a template with status ${templateStatus}, then page is loaded with template details`, async ({
        page,
        baseURL,
      }) => {
        const template = getTemplate();

        const previewSubmittedLetterTemplatePage =
          new TemplateMgmtPreviewApprovedLetterPage(page).setPathParam(
            'templateId',
            template.id
          );

        await previewSubmittedLetterTemplatePage.loadPage();

        await expect(page).toHaveURL(
          `${baseURL}/templates/preview-approved-letter-template/${template.id}`
        );

        await expect(
          previewSubmittedLetterTemplatePage.pageHeading
        ).toContainText(template.name);

        expect(template.campaignId).toBeTruthy();

        await expect(
          previewSubmittedLetterTemplatePage.campaignId
        ).toContainText(template.campaignId!);

        await expect(previewSubmittedLetterTemplatePage.statusTag).toHaveText(
          expectedTag
        );

        await expect(previewSubmittedLetterTemplatePage.copyLink).toHaveCount(
          0
        );
      });
    }
  });

  test.describe('Error handling', () => {
    const cases = [
      { title: 'an unsubmitted', getTemplateId: () => templates.invalid.id },
      {
        title: 'a nonexistent',
        getTemplateId: () => 'nonexistent-template-id',
      },
      { title: 'a pdf letter', getTemplateId: () => templates.pdf.id },
      { title: 'an nhsapp', getTemplateId: () => templates.nhsapp.id },
    ];

    for (const { title, getTemplateId } of cases) {
      test(`when user visits page with the id for ${title} template, then an invalid template error is displayed`, async ({
        baseURL,
        page,
      }) => {
        const previewSubmittedLetterTemplatePage =
          new TemplateMgmtPreviewApprovedLetterPage(page).setPathParam(
            'templateId',
            getTemplateId()
          );

        await previewSubmittedLetterTemplatePage.loadPage();

        await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
      });
    }
  });
});
