import { test, expect } from '@playwright/test';
import { TemplateStorageHelper } from '../../helpers/db/template-storage-helper';
import { TemplateFactory } from '../../helpers/factories/template-factory';
import { Template } from '../../helpers/types';
import {
  createAuthHelper,
  testUsers,
  type TestUser,
} from '../../helpers/auth/cognito-auth-helper';
import { TemplateMgmtPreviewLetterPage } from '../../pages/letter/template-mgmt-preview-letter-page';
import { TemplateMgmtSubmitLetterPage } from '../../pages/letter/template-mgmt-submit-letter-page';
import { TemplateMgmtRequestProofPage } from '../../pages/template-mgmt-request-proof-page';
import { loginAsUser } from '../../helpers/auth/login-as-user';

async function createTemplates(user: TestUser) {
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
    authoringInvalid: {
      id: 'preview-page-invalid-authoring-letter',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateType: 'LETTER',
      templateStatus: 'NOT_YET_SUBMITTED',
      owner: `CLIENT#${user.clientId}`,
      letterVersion: 'AUTHORING',
      lockNumber: 0,
      name: 'invalid-authoring-letter',
      // Missing files - invalid
    } as Template,
    authoringValid: TemplateFactory.createAuthoringLetterTemplate(
      'A1B2C3D4-E5F6-7890-ABCD-EF1234567890',
      user,
      'authoring-letter-valid',
      'NOT_YET_SUBMITTED',
      {
        letterVariantId: 'variant-123',
        initialRender: { pageCount: 4 },
      }
    ),
    authoringNoInitialRender: TemplateFactory.createAuthoringLetterTemplate(
      'C3D4E5F6-A7B8-9012-CDEF-123456789012',
      user,
      'authoring-letter-no-initial-render',
      'NOT_YET_SUBMITTED',
      {
        letterVariantId: 'variant-no-render',
        initialRender: false,
      }
    ),
    authoringNoCampaign: TemplateFactory.createAuthoringLetterTemplate(
      'B2C3D4E5-F6A7-8901-BCDE-F23456789012',
      user,
      'authoring-letter-no-campaign',
      'NOT_YET_SUBMITTED',
      {
        letterVariantId: 'variant-456',
        campaignId: null,
        initialRender: { pageCount: 4 },
      }
    ),
    authoringWithInitialRender: TemplateFactory.createAuthoringLetterTemplate(
      'D4E5F6A7-B8C9-0123-DEFA-456789012345',
      user,
      'authoring-letter-with-render',
      'NOT_YET_SUBMITTED',
      {
        letterVariantId: 'variant-render',
        initialRender: { currentVersion: 'v1-test', pageCount: 4 },
      }
    ),
    authoringVirusScanFailed: TemplateFactory.createAuthoringLetterTemplate(
      'E5F6A7B8-C9D0-1234-EFAB-567890123456',
      user,
      'authoring-virus-scan-failed',
      'VALIDATION_FAILED',
      {
        letterVariantId: 'variant-virus',
        validationErrors: ['VIRUS_SCAN_FAILED'],
        initialRender: false,
      }
    ),
    authoringMissingAddressLines: TemplateFactory.createAuthoringLetterTemplate(
      'F6A7B8C9-D0E1-2345-FABC-678901234567',
      user,
      'authoring-missing-address-lines',
      'VALIDATION_FAILED',
      {
        letterVariantId: 'variant-address',
        validationErrors: ['MISSING_ADDRESS_LINES'],
        initialRender: false,
      }
    ),
    authoringWithCustomFields: TemplateFactory.createAuthoringLetterTemplate(
      'A7B8C9D0-E1F2-3456-ABCD-789012345678',
      user,
      'authoring-with-custom-fields',
      'NOT_YET_SUBMITTED',
      {
        letterVariantId: 'variant-custom',
        customPersonalisation: ['appointmentDate', 'clinicName', 'doctorName'],
        initialRender: {
          fileName: 'custom-render.pdf',
          currentVersion: 'v1-custom',
          pageCount: 4,
        },
      }
    ),
    authoringValidationFailedWithRender:
      TemplateFactory.createAuthoringLetterTemplate(
        'B8C9D0E1-F2A3-4567-BCDE-890123456789',
        user,
        'authoring-validation-failed-with-render',
        'VALIDATION_FAILED',
        {
          letterVariantId: 'variant-fail-render',
          validationErrors: ['VIRUS_SCAN_FAILED'],
          initialRender: {
            fileName: 'failed-render.pdf',
            currentVersion: 'v1-failed',
            pageCount: 4,
          },
        }
      ),
  };
}

test.describe('Preview Letter template Page', () => {
  let templates: Awaited<ReturnType<typeof createTemplates>>;

  const templateStorageHelper = new TemplateStorageHelper();

  test.beforeAll(async () => {
    const user = await createAuthHelper().getTestUser(testUsers.User1.userId);
    templates = await createTemplates(user);
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

    test('when user visits page with missing data, then an invalid template error is displayed', async ({
      baseURL,
      page,
    }) => {
      const previewPage = new TemplateMgmtPreviewLetterPage(page).setPathParam(
        'templateId',
        templates.authoringInvalid.id
      );

      await previewPage.loadPage();

      await expect(page).toHaveURL(`${baseURL}/templates/invalid-template`);
    });

    test('shows campaign Edit link when template has no campaignId', async ({
      page,
    }) => {
      const previewPage = new TemplateMgmtPreviewLetterPage(page).setPathParam(
        'templateId',
        templates.authoringNoCampaign.id
      );

      await previewPage.loadPage();

      await expect(previewPage.campaignAction).toBeVisible();
      await expect(previewPage.campaignAction).toHaveText(/Edit/);
    });

    test('hides campaign Edit link when template has campaignId (single-campaign client)', async ({
      page,
    }) => {
      const previewPage = new TemplateMgmtPreviewLetterPage(page).setPathParam(
        'templateId',
        templates.authoringValid.id
      );

      await previewPage.loadPage();

      await expect(previewPage.campaignAction).toBeHidden();
    });

    test.describe('Letter render section', () => {
      test('displays letter render section with tabs when initialRender exists', async ({
        page,
      }) => {
        const previewPage = new TemplateMgmtPreviewLetterPage(
          page
        ).setPathParam('templateId', templates.authoringWithInitialRender.id);

        await previewPage.loadPage();

        await expect(previewPage.letterRender).toBeVisible();

        await expect(previewPage.shortTab.tab).toBeVisible();
        await expect(previewPage.longTab.tab).toBeVisible();

        await expect(previewPage.shortTab.tab).toHaveAttribute(
          'aria-selected',
          'true'
        );

        await expect(previewPage.shortTab.recipientSelect).toBeVisible();
        await expect(previewPage.shortTab.updatePreviewButton).toBeVisible();

        await expect(previewPage.shortTab.previewIframe).toBeVisible();
      });

      test('hides letter preview section when no initialRender', async ({
        page,
      }) => {
        const previewPage = new TemplateMgmtPreviewLetterPage(
          page
        ).setPathParam('templateId', templates.authoringNoInitialRender.id);

        await previewPage.loadPage();

        await expect(previewPage.letterRender).toBeHidden();
      });

      test('can switch between short and long example tabs', async ({
        page,
      }) => {
        const previewPage = new TemplateMgmtPreviewLetterPage(
          page
        ).setPathParam('templateId', templates.authoringWithInitialRender.id);

        await previewPage.loadPage();

        await expect(previewPage.shortTab.tab).toHaveAttribute(
          'aria-selected',
          'true'
        );
        await expect(previewPage.longTab.tab).toHaveAttribute(
          'aria-selected',
          'false'
        );

        await previewPage.longTab.clickTab();

        await expect(previewPage.longTab.tab).toHaveAttribute(
          'aria-selected',
          'true'
        );
        await expect(previewPage.shortTab.tab).toHaveAttribute(
          'aria-selected',
          'false'
        );
      });

      test('can select an example recipient from dropdown', async ({
        page,
      }) => {
        const previewPage = new TemplateMgmtPreviewLetterPage(
          page
        ).setPathParam('templateId', templates.authoringWithInitialRender.id);

        await previewPage.loadPage();

        await expect(previewPage.shortTab.recipientSelect).toHaveValue('');

        await previewPage.shortTab.selectRecipient({ index: 1 });

        await expect(previewPage.shortTab.recipientSelect).not.toHaveValue('');
      });

      test('long tab has its own form elements', async ({ page }) => {
        const previewPage = new TemplateMgmtPreviewLetterPage(
          page
        ).setPathParam('templateId', templates.authoringWithInitialRender.id);

        await previewPage.loadPage();

        await previewPage.longTab.clickTab();

        await expect(previewPage.longTab.recipientSelect).toBeVisible();
        await expect(previewPage.longTab.updatePreviewButton).toBeVisible();
        await expect(previewPage.longTab.previewIframe).toBeVisible();

        await expect(previewPage.longTab.recipientSelect).toHaveValue('');

        await previewPage.longTab.selectRecipient({ index: 1 });

        await expect(previewPage.longTab.recipientSelect).not.toHaveValue('');
      });

      test('clicking Update preview button does not navigate away', async ({
        page,
      }) => {
        const previewPage = new TemplateMgmtPreviewLetterPage(
          page
        ).setPathParam('templateId', templates.authoringWithInitialRender.id);

        await previewPage.loadPage();
        const url = previewPage.getUrl();

        await previewPage.shortTab.selectRecipient({ index: 1 });

        await previewPage.shortTab.clickUpdatePreview();

        await expect(page).toHaveURL(url);

        await expect(previewPage.shortTab.recipientSelect).toBeVisible();
        await expect(previewPage.shortTab.updatePreviewButton).toBeVisible();
      });

      test('preserves form data when switching between tabs', async ({
        page,
      }) => {
        const previewPage = new TemplateMgmtPreviewLetterPage(
          page
        ).setPathParam('templateId', templates.authoringWithCustomFields.id);

        await previewPage.loadPage();

        // Fill in short tab form data
        await previewPage.shortTab.selectRecipient({ index: 1 });
        const shortSelectedValue =
          await previewPage.shortTab.recipientSelect.inputValue();

        const shortAppointmentDate =
          previewPage.shortTab.getCustomFieldInput('appointmentDate');
        const shortClinicName =
          previewPage.shortTab.getCustomFieldInput('clinicName');
        const shortDoctorName =
          previewPage.shortTab.getCustomFieldInput('doctorName');

        await shortAppointmentDate.fill('15 March 2025');
        await shortClinicName.fill('City Hospital');
        await shortDoctorName.fill('Dr Smith');

        // Switch to long tab and fill different data
        await previewPage.longTab.clickTab();

        await previewPage.longTab.selectRecipient({ index: 2 });
        const longSelectedValue =
          await previewPage.longTab.recipientSelect.inputValue();

        const longAppointmentDate =
          previewPage.longTab.getCustomFieldInput('appointmentDate');
        const longClinicName =
          previewPage.longTab.getCustomFieldInput('clinicName');
        const longDoctorName =
          previewPage.longTab.getCustomFieldInput('doctorName');

        await longAppointmentDate.fill('20 April 2025');
        await longClinicName.fill('County Clinic');
        await longDoctorName.fill('Dr Jones');

        // Switch back to short tab and verify data is preserved
        await previewPage.shortTab.clickTab();

        await expect(previewPage.shortTab.recipientSelect).toHaveValue(
          shortSelectedValue
        );
        await expect(shortAppointmentDate).toHaveValue('15 March 2025');
        await expect(shortClinicName).toHaveValue('City Hospital');
        await expect(shortDoctorName).toHaveValue('Dr Smith');

        // Switch back to long tab and verify data is preserved
        await previewPage.longTab.clickTab();

        await expect(previewPage.longTab.recipientSelect).toHaveValue(
          longSelectedValue
        );
        await expect(longAppointmentDate).toHaveValue('20 April 2025');
        await expect(longClinicName).toHaveValue('County Clinic');
        await expect(longDoctorName).toHaveValue('Dr Jones');
      });
    });

    test.describe('Custom personalisation fields', () => {
      test('displays custom personalisation section when template has custom fields', async ({
        page,
      }) => {
        const previewPage = new TemplateMgmtPreviewLetterPage(
          page
        ).setPathParam('templateId', templates.authoringWithCustomFields.id);

        await previewPage.loadPage();

        await expect(previewPage.shortTab.customFieldsHeading).toBeVisible();

        const appointmentDateInput =
          previewPage.shortTab.getCustomFieldInput('appointmentDate');
        const clinicNameInput =
          previewPage.shortTab.getCustomFieldInput('clinicName');
        const doctorNameInput =
          previewPage.shortTab.getCustomFieldInput('doctorName');

        await expect(appointmentDateInput).toBeVisible();
        await expect(clinicNameInput).toBeVisible();
        await expect(doctorNameInput).toBeVisible();
      });

      test('custom fields are editable', async ({ page }) => {
        const previewPage = new TemplateMgmtPreviewLetterPage(
          page
        ).setPathParam('templateId', templates.authoringWithCustomFields.id);

        await previewPage.loadPage();

        const appointmentDateInput =
          previewPage.shortTab.getCustomFieldInput('appointmentDate');
        await appointmentDateInput.fill('15 March 2025');

        await expect(appointmentDateInput).toHaveValue('15 March 2025');
      });

      test('same custom fields are present in long tab', async ({ page }) => {
        const previewPage = new TemplateMgmtPreviewLetterPage(
          page
        ).setPathParam('templateId', templates.authoringWithCustomFields.id);

        await previewPage.loadPage();

        await previewPage.longTab.clickTab();

        await expect(previewPage.longTab.customFieldsHeading).toBeVisible();

        const appointmentDateInput =
          previewPage.longTab.getCustomFieldInput('appointmentDate');
        await expect(appointmentDateInput).toBeVisible();
      });

      test('hides custom personalisation section when template has no custom fields', async ({
        page,
      }) => {
        const previewPage = new TemplateMgmtPreviewLetterPage(
          page
        ).setPathParam('templateId', templates.authoringWithInitialRender.id);

        await previewPage.loadPage();

        await expect(previewPage.shortTab.customFieldsHeading).toBeHidden();
      });
    });

    test.describe('Validation errors for AUTHORING letters', () => {
      test('displays virus scan failed error when status is VALIDATION_FAILED with VIRUS_SCAN_FAILED', async ({
        page,
      }) => {
        const previewPage = new TemplateMgmtPreviewLetterPage(
          page
        ).setPathParam('templateId', templates.authoringVirusScanFailed.id);

        await previewPage.loadPage();

        await expect(previewPage.errorSummary).toBeVisible();

        await expect(previewPage.errorSummary).toContainText(
          'The file(s) you uploaded may contain a virus'
        );

        await expect(previewPage.continueButton).toBeHidden();

        await expect(previewPage.editNameLink).toBeHidden();
      });

      test('displays missing address lines error when status is VALIDATION_FAILED with MISSING_ADDRESS_LINES', async ({
        page,
      }) => {
        const previewPage = new TemplateMgmtPreviewLetterPage(
          page
        ).setPathParam('templateId', templates.authoringMissingAddressLines.id);

        await previewPage.loadPage();

        await expect(previewPage.errorSummary).toBeVisible();

        await expect(previewPage.errorSummary).toContainText(
          'The template file you uploaded does not contain the address fields'
        );

        await expect(previewPage.continueButton).toBeHidden();
      });

      test('hides letter preview section when VALIDATION_FAILED with no initialRender', async ({
        page,
      }) => {
        const previewPage = new TemplateMgmtPreviewLetterPage(
          page
        ).setPathParam('templateId', templates.authoringVirusScanFailed.id);

        await previewPage.loadPage();

        await expect(previewPage.letterRender).toBeHidden();
      });

      test('shows letter preview section when VALIDATION_FAILED but has initialRender', async ({
        page,
      }) => {
        const previewPage = new TemplateMgmtPreviewLetterPage(
          page
        ).setPathParam(
          'templateId',
          templates.authoringValidationFailedWithRender.id
        );

        await previewPage.loadPage();

        await expect(previewPage.errorSummary).toBeVisible();

        await expect(previewPage.letterRender).toBeVisible();
      });

      test('hides campaign and postage rows when VALIDATION_FAILED', async ({
        page,
      }) => {
        const previewPage = new TemplateMgmtPreviewLetterPage(
          page
        ).setPathParam('templateId', templates.authoringVirusScanFailed.id);

        await previewPage.loadPage();

        await expect(page.getByText('Campaign')).toBeHidden();

        await expect(page.getByText('Printing and postage')).toBeHidden();
      });
    });

    test.describe('multi-campaign client', () => {
      test.use({ storageState: { cookies: [], origins: [] } });

      const multiCampaignTemplateStorageHelper = new TemplateStorageHelper();
      let userWithMultipleCampaigns: TestUser;
      let multiCampaignTemplate: Template;

      test.beforeAll(async () => {
        userWithMultipleCampaigns = await createAuthHelper().getTestUser(
          testUsers.UserWithMultipleCampaigns.userId
        );

        multiCampaignTemplate = TemplateFactory.createAuthoringLetterTemplate(
          'C3D4E5F6-A7B8-9012-CDEF-345678901234',
          userWithMultipleCampaigns,
          'authoring-letter-multi-campaign',
          'NOT_YET_SUBMITTED',
          {
            letterVariantId: 'variant-789',
            initialRender: {
              fileName: 'multi-campaign-render.pdf',
              pageCount: 4,
            },
          }
        );

        await multiCampaignTemplateStorageHelper.seedTemplateData([
          multiCampaignTemplate,
        ]);
      });

      test.afterAll(async () => {
        await multiCampaignTemplateStorageHelper.deleteSeededTemplates();
      });

      test('shows campaign Edit link when template has campaignId', async ({
        page,
      }) => {
        await loginAsUser(userWithMultipleCampaigns, page);

        const previewPage = new TemplateMgmtPreviewLetterPage(
          page
        ).setPathParam('templateId', multiCampaignTemplate.id);

        await previewPage.loadPage();

        await expect(previewPage.campaignAction).toBeVisible();
        await expect(previewPage.campaignAction).toHaveText(/Edit/);
      });
    });
  });
});
