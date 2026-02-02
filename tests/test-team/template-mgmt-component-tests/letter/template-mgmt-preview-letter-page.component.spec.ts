import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import { Template } from '../../helpers/types';
import {
  createAuthHelper,
  testUsers,
} from '../../helpers/auth/cognito-auth-helper';
import { TemplateMgmtPreviewLetterPage } from '../../pages/letter/template-mgmt-preview-letter-page';
import { TemplateMgmtSubmitLetterPage } from '../../pages/letter/template-mgmt-submit-letter-page';
import { TemplateMgmtRequestProofPage } from '../../pages/template-mgmt-request-proof-page';

async function createTemplates() {
  const user = await createAuthHelper().getTestUser(testUsers.User1.userId);

  const withProofsBase = TemplateFactory.uploadLetterTemplate(
    'C8814A1D-1F3A-4AE4-9FE3-BDDA76EADF0C',
    user,
    'proofs-template-letter',
    'PROOF_AVAILABLE',
    'PASSED'
  );

  const withProofs: Template = {
    ...withProofsBase,
    files: {
      ...withProofsBase.files,
      proofs: {
        'a.pdf': {
          virusScanStatus: 'FAILED',
          supplier: 'WTMMOCK',
          fileName: 'a.pdf',
        },
        'b.pdf': {
          virusScanStatus: 'PASSED',
          supplier: 'WTMMOCK',
          fileName: 'b.pdf',
        },
      },
    },
  };

  return {
    empty: {
      id: 'preview-page-invalid-letter-template',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateType: 'LETTER',
      templateStatus: 'NOT_YET_SUBMITTED',
      owner: `CLIENT#${user.clientId}`,
      letterVersion: 'PDF',
    } as Template,
    notYetSubmitted: TemplateFactory.uploadLetterTemplate(
      '9AACCD57-C6A3-4273-854C-3839A081B4D9',
      user,
      'notYetSubmitted',
      'NOT_YET_SUBMITTED'
    ),
    pendingProofRequest: TemplateFactory.uploadLetterTemplate(
      '10AE654B-72B5-4A67-913C-2E103C7FF47B',
      user,
      'pendingProofRequest',
      'PENDING_PROOF_REQUEST'
    ),
    pendingUpload: TemplateFactory.uploadLetterTemplate(
      '5C442DA9-B555-4CEA-AFE9-143851FD210B',
      user,
      'pendingUpload',
      'PENDING_UPLOAD'
    ),
    pending: TemplateFactory.uploadLetterTemplate(
      '7110530b-3565-4d4d-b2d7-56a319d55fde',
      user,
      'test-pending-template-letter',
      'PENDING_UPLOAD',
      'PENDING'
    ),
    virus: TemplateFactory.uploadLetterTemplate(
      'd2d32123-0a60-4333-bbde-d22e5d5ef6d9',
      user,
      'test-virus-template-letter',
      'VIRUS_SCAN_FAILED',
      'FAILED'
    ),
    invalid: TemplateFactory.uploadLetterTemplate(
      'b6cace12-556a-4e84-ab79-768d82539b6f',
      user,
      'test-invalid-template-letter',
      'VALIDATION_FAILED',
      'PASSED'
    ),
    proofingDisabled: {
      ...TemplateFactory.uploadLetterTemplate(
        '9AACCD57-C6A3-4273-854C-3839A081B4D8',
        user,
        'ProofingDisabled',
        'NOT_YET_SUBMITTED'
      ),
      proofingEnabled: false,
    },
    proofApproved: {
      ...withProofs,
      templateStatus: 'PROOF_APPROVED',
      id: '321B92CF-AECC-4938-B4CA-B00E4797327A',
    },
    withProofs,
    // AUTHORING letter templates
    authoringEmpty: {
      id: 'preview-page-invalid-authoring-letter',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateType: 'LETTER',
      templateStatus: 'NOT_YET_SUBMITTED',
      owner: `CLIENT#${user.clientId}`,
      letterVersion: 'AUTHORING',
      lockNumber: 0,
      name: 'empty-authoring-letter',
      // Missing sidesCount - should be invalid
    } as Template,
    authoringValid: TemplateFactory.createAuthoringLetterTemplate(
      'A1B2C3D4-E5F6-7890-ABCD-EF1234567890',
      user,
      'authoring-letter-valid',
      'NOT_YET_SUBMITTED',
      { sidesCount: 4, letterVariantId: 'variant-123' }
    ),
  };
}

test.describe('Preview Letter template Page', () => {
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
  }) => {
    const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(
      page
    ).setPathParam('templateId', templates.notYetSubmitted.id);

    await previewLetterTemplatePage.loadPage();

    await expect(page).toHaveURL(previewLetterTemplatePage.getUrl());

    await expect(previewLetterTemplatePage.pageHeading).toContainText(
      templates.notYetSubmitted.name
    );

    if (!templates.notYetSubmitted.campaignId) {
      throw new Error('Test data misconfiguration');
    }

    await expect(previewLetterTemplatePage.campaignId).toContainText(
      templates.notYetSubmitted.campaignId
    );

    await previewLetterTemplatePage.clickContinueButton();

    const submitPage = new TemplateMgmtSubmitLetterPage(page)
      .setPathParam('templateId', templates.notYetSubmitted.id)
      .setSearchParam(
        'lockNumber',
        String(templates.notYetSubmitted.lockNumber)
      );

    await expect(page).toHaveURL(submitPage.getUrl());
  });

  test('when proofingEnabled is false, user can click to go submit page', async ({
    page,
  }) => {
    const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(
      page
    ).setPathParam('templateId', templates.proofingDisabled.id);

    await previewLetterTemplatePage.loadPage();

    await expect(page).toHaveURL(previewLetterTemplatePage.getUrl());

    await expect(previewLetterTemplatePage.pageHeading).toContainText(
      templates.proofingDisabled.name
    );

    await previewLetterTemplatePage.clickContinueButton();

    const submitPage = new TemplateMgmtSubmitLetterPage(page)
      .setPathParam('templateId', templates.proofingDisabled.id)
      .setSearchParam(
        'lockNumber',
        String(templates.proofingDisabled.lockNumber)
      );

    await expect(page).toHaveURL(submitPage.getUrl());
  });

  test('when template is pending a proof request, user can click to go to request page', async ({
    page,
  }) => {
    const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(
      page
    ).setPathParam('templateId', templates.pendingProofRequest.id);

    await previewLetterTemplatePage.loadPage();

    await expect(page).toHaveURL(previewLetterTemplatePage.getUrl());

    await expect(previewLetterTemplatePage.pageHeading).toContainText(
      templates.pendingProofRequest.name
    );

    await previewLetterTemplatePage.clickContinueButton();

    const requestProofPage = new TemplateMgmtRequestProofPage(page)
      .setPathParam('templateId', templates.pendingProofRequest.id)
      .setSearchParam(
        'lockNumber',
        String(templates.pendingProofRequest.lockNumber)
      );

    await expect(page).toHaveURL(requestProofPage.getUrl());
  });

  test('when status is not actionable (PENDING_UPLOAD), no continue button is displayed', async ({
    page,
  }) => {
    const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(
      page
    ).setPathParam('templateId', templates.pendingUpload.id);

    await previewLetterTemplatePage.loadPage();

    await expect(page).toHaveURL(previewLetterTemplatePage.getUrl());

    await expect(previewLetterTemplatePage.pageHeading).toContainText(
      templates.pendingUpload.name
    );

    await expect(previewLetterTemplatePage.errorSummary).toBeHidden();
    await expect(previewLetterTemplatePage.continueButton).toBeHidden();
  });

  test('when status is not actionable (PROOF_APPROVED), no continue button is displayed', async ({
    page,
  }) => {
    const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(
      page
    ).setPathParam('templateId', templates.proofApproved.id);

    await previewLetterTemplatePage.loadPage();

    await expect(page).toHaveURL(previewLetterTemplatePage.getUrl());

    await expect(previewLetterTemplatePage.pageHeading).toContainText(
      templates.proofApproved.name
    );

    await expect(previewLetterTemplatePage.statusTag).toContainText(
      'Proof approved'
    );

    await expect(previewLetterTemplatePage.errorSummary).toBeHidden();
    await expect(previewLetterTemplatePage.continueButton).toBeHidden();
  });

  test.describe('Error handling', () => {
    test('when user visits page with missing data, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(
        page
      ).setPathParam('templateId', templates.empty.id);

      await previewLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with a fake template, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(
        page
      ).setPathParam('templateId', 'fake-template-id');

      await previewLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('when user visits page with pending files, submit is unavailable', async ({
      page,
    }) => {
      const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(
        page
      ).setPathParam('templateId', templates.pending.id);

      await previewLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(previewLetterTemplatePage.getUrl());

      await expect(previewLetterTemplatePage.pageHeading).toContainText(
        'test-pending-template-letter'
      );

      await expect(previewLetterTemplatePage.errorSummary).toBeHidden();
      await expect(previewLetterTemplatePage.continueButton).toBeHidden();
    });

    test('when user visits page with failed virus scan, submit is unavailable and an error is displayed', async ({
      page,
    }) => {
      const errorMessage = 'The file(s) you uploaded may contain a virus.';

      const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(
        page
      ).setPathParam('templateId', templates.virus.id);

      await previewLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(previewLetterTemplatePage.getUrl());

      await expect(previewLetterTemplatePage.pageHeading).toContainText(
        'test-virus-template-letter'
      );

      await expect(previewLetterTemplatePage.errorSummary).toBeVisible();
      await expect(previewLetterTemplatePage.errorSummary).toContainText(
        errorMessage
      );
      await expect(previewLetterTemplatePage.continueButton).toBeHidden();
    });

    test('when user visits page with failed validation, submit is unavailable and an error is displayed', async ({
      page,
    }) => {
      const errorMessage =
        'The personalisation fields in your files are missing or do not match.';

      const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(
        page
      ).setPathParam('templateId', templates.invalid.id);

      await previewLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(previewLetterTemplatePage.getUrl());

      await expect(previewLetterTemplatePage.pageHeading).toContainText(
        'test-invalid-template-letter'
      );

      await expect(previewLetterTemplatePage.errorSummary).toBeVisible();
      await expect(previewLetterTemplatePage.errorSummary).toContainText(
        errorMessage
      );
      await expect(previewLetterTemplatePage.continueButton).toBeHidden();
    });

    test('when the template has proofs, only those passing the virus scan are displayed', async ({
      page,
    }) => {
      const previewLetterTemplatePage = new TemplateMgmtPreviewLetterPage(
        page
      ).setPathParam('templateId', templates.withProofs.id);

      await previewLetterTemplatePage.loadPage();

      await expect(page).toHaveURL(previewLetterTemplatePage.getUrl());

      await expect(previewLetterTemplatePage.pageHeading).toContainText(
        templates.withProofs.name
      );

      await expect(previewLetterTemplatePage.pdfLinks).toHaveCount(1);

      const pdfLink = previewLetterTemplatePage.pdfLinks.first();

      await expect(pdfLink).toHaveText('b.pdf');
      await expect(pdfLink).toHaveAttribute(
        'href',
        // eslint-disable-next-line security/detect-non-literal-regexp
        new RegExp(
          `^/templates/files/[^/]+/proofs/${templates.withProofs.id}/b.pdf$`
        )
      );
    });
  });

  test.describe('AUTHORING letter', () => {
    test('when user visits page, then page is loaded with template details', async ({
      page,
      baseURL,
    }) => {
      const previewPage = new TemplateMgmtPreviewLetterPage(page).setPathParam(
        'templateId',
        templates.authoringValid.id
      );

      await previewPage.loadPage();

      await expect(page).toHaveURL(
        `${baseURL}/templates/preview-letter-template/${templates.authoringValid.id}`
      );

      await expect(previewPage.pageHeading).toContainText(
        templates.authoringValid.name
      );

      await expect(previewPage.templateId).toContainText(
        templates.authoringValid.id
      );

      await expect(previewPage.editNameLink).toBeVisible();

      await expect(previewPage.statusTag).toBeVisible();
    });

    test('displays Learn more links with correct external URLs', async ({
      page,
    }) => {
      const previewPage = new TemplateMgmtPreviewLetterPage(page).setPathParam(
        'templateId',
        templates.authoringValid.id
      );

      await previewPage.loadPage();

      await expect(previewPage.sheetsAction).toHaveAttribute(
        'href',
        'https://notify.nhs.uk/pricing-and-commercial/letters'
      );

      await expect(previewPage.statusAction).toHaveAttribute(
        'href',
        'https://notify.nhs.uk/templates/what-template-statuses-mean'
      );
    });

    test('when user visits page with missing data, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewPage = new TemplateMgmtPreviewLetterPage(page).setPathParam(
        'templateId',
        templates.authoringEmpty.id
      );

      await previewPage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });
  });
});
