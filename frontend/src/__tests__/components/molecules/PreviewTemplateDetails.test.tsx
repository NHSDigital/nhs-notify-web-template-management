import PreviewTemplateDetailsEmail from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsEmail';
import PreviewTemplateDetailsLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsLetter';
import PreviewTemplateDetailsNhsApp from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsNhsApp';
import PreviewTemplateDetailsSms from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsSms';
import { render } from '@testing-library/react';

describe('PreviewTemplateDetailsNhsApp', () => {
  it('matches snapshot', () => {
    const container = render(
      <PreviewTemplateDetailsNhsApp
        template={{
          id: 'template-id',
          name: 'Example template',
          message: 'app content',
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: 'NHS_APP',
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});

describe('PreviewTemplateDetailsEmail', () => {
  it('matches snapshot', () => {
    const container = render(
      <PreviewTemplateDetailsEmail
        template={{
          id: 'template-id',
          name: 'Example Email template',
          message: 'email content',
          subject: 'email subject',
          templateStatus: 'SUBMITTED',
          templateType: 'EMAIL',
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});

describe('PreviewTemplateDetailsSms', () => {
  it('matches snapshot', () => {
    const container = render(
      <PreviewTemplateDetailsSms
        template={{
          id: 'template-id',
          name: 'SMS template',
          message: 'SMS content',
          templateStatus: 'SUBMITTED',
          templateType: 'SMS',
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});

describe('PreviewTemplateDetailsLetter', () => {
  it('matches snapshot without proofs', () => {
    const container = render(
      <PreviewTemplateDetailsLetter
        template={{
          id: 'template-id',
          name: 'Example template',
          templateStatus: 'PENDING_VALIDATION',
          templateType: 'LETTER',
          letterType: 'x0',
          letterVersion: 'PDF_PROOFING',
          language: 'fr',
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: '4C728B7D-A028-4BA2-B180-A63CDD2AE1E9',
              virusScanStatus: 'PENDING',
            },
            testDataCsv: {
              fileName: 'file.csv',
              currentVersion: '622AB7FA-29BA-418A-B1B6-1E63FB299269',
              virusScanStatus: 'PENDING',
            },
          },
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when test data CSV is absent', () => {
    const container = render(
      <PreviewTemplateDetailsLetter
        template={{
          id: 'template-id',
          name: 'Example template',
          templateStatus: 'PENDING_VALIDATION',
          templateType: 'LETTER',
          letterType: 'x0',
          letterVersion: 'PDF_PROOFING',
          language: 'fr',
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: '4C728B7D-A028-4BA2-B180-A63CDD2AE1E9',
              virusScanStatus: 'PENDING',
            },
          },
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when proofs are present, proofs failing virus scan are not displayed', () => {
    const container = render(
      <PreviewTemplateDetailsLetter
        template={{
          id: 'template-id',
          clientId: 'client-id',
          name: 'Example letter',
          templateStatus: 'PROOF_AVAILABLE',
          templateType: 'LETTER',
          letterType: 'x0',
          letterVersion: 'PDF_PROOFING',
          language: 'en',
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: '4C728B7D-A028-4BA2-B180-A63CDD2AE1E9',
              virusScanStatus: 'PASSED',
            },
            testDataCsv: {
              fileName: 'file.csv',
              currentVersion: '622AB7FA-29BA-418A-B1B6-1E63FB299269',
              virusScanStatus: 'PASSED',
            },
            proofs: {
              'a.pdf': {
                fileName: 'a.pdf',
                virusScanStatus: 'PASSED',
                supplier: 'MBA',
              },
              'b.pdf': {
                fileName: 'b.pdf',
                virusScanStatus: 'PASSED',
                supplier: 'MBA',
              },
              'c.pdf': {
                fileName: 'c.pdf',
                virusScanStatus: 'FAILED',
                supplier: 'MBA',
              },
            },
          },
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('if status is PROOF_AVAILABLE, but no proofs are registered on the template, proof section is hidden (this is unexpected)', () => {
    const container = render(
      <PreviewTemplateDetailsLetter
        template={{
          id: 'template-id',
          name: 'Example letter',
          templateStatus: 'PROOF_AVAILABLE',
          templateType: 'LETTER',
          letterType: 'x0',
          letterVersion: 'PDF_PROOFING',
          language: 'en',
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: '4C728B7D-A028-4BA2-B180-A63CDD2AE1E9',
              virusScanStatus: 'PASSED',
            },
          },
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('if status is NOT_YET_SUBMITTED, then Not yet submitted is displayed', () => {
    const container = render(
      <PreviewTemplateDetailsLetter
        template={{
          id: 'template-id',
          name: 'Example letter',
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: 'LETTER',
          letterType: 'x0',
          letterVersion: 'PDF_PROOFING',
          language: 'en',
          files: {
            pdfTemplate: {
              fileName: 'file.pdf',
              currentVersion: '4C728B7D-A028-4BA2-B180-A63CDD2AE1E9',
              virusScanStatus: 'PASSED',
            },
          },
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});
