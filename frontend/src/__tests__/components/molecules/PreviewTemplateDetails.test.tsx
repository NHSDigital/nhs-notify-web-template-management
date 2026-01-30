import PreviewTemplateDetailsAuthoringLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsAuthoringLetter';
import PreviewTemplateDetailsEmail from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsEmail';
import PreviewTemplateDetailsLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsLetter';
import PreviewTemplateDetailsNhsApp from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsNhsApp';
import PreviewTemplateDetailsSms from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsSms';
import { render, screen } from '@testing-library/react';
import { useFeatureFlags } from '@providers/client-config-provider';

jest.mock('@providers/client-config-provider');

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(useFeatureFlags).mockReturnValue({ routing: false });
});

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
          letterVersion: 'PDF',
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
          letterVersion: 'PDF',
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
          letterVersion: 'PDF',
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
          letterVersion: 'PDF',
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
          letterVersion: 'PDF',
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

describe('PreviewTemplateDetailsAuthoringLetter', () => {
  it('matches snapshot for AUTHORING letter', () => {
    const container = render(
      <PreviewTemplateDetailsAuthoringLetter
        template={{
          id: 'template-id',
          name: 'Example AUTHORING letter',
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: 'LETTER',
          letterType: 'x0',
          letterVersion: 'AUTHORING',
          letterVariantId: 'variant-123',
          sidesCount: 2,
          language: 'en',
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders Edit name link below template name', () => {
    render(
      <PreviewTemplateDetailsAuthoringLetter
        template={{
          id: 'template-id',
          name: 'Example AUTHORING letter',
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: 'LETTER',
          letterType: 'x0',
          letterVersion: 'AUTHORING',
          letterVariantId: 'variant-123',
          sidesCount: 2,
          language: 'en',
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
      />
    );

    const editNameLink = screen.getByTestId('edit-name-link');
    expect(editNameLink).toBeInTheDocument();
    expect(editNameLink).toHaveTextContent('Edit name');
  });

  it('renders action links in summary list rows', () => {
    render(
      <PreviewTemplateDetailsAuthoringLetter
        template={{
          id: 'template-id',
          name: 'Example AUTHORING letter',
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: 'LETTER',
          letterType: 'x0',
          letterVersion: 'AUTHORING',
          letterVariantId: 'variant-123',
          sidesCount: 4,
          language: 'en',
          campaignId: 'campaign-123',
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
      />
    );

    // Campaign has "Edit" action
    expect(screen.getByTestId('campaign-action')).toHaveTextContent('Edit');
    // Sheets has "Learn more" action
    expect(screen.getByTestId('sheets-action')).toHaveTextContent('Learn more');
    // Printing and postage has "Edit" action
    expect(screen.getByTestId('printing-postage-action')).toHaveTextContent(
      'Edit'
    );
    // Status has "Learn more" action
    expect(screen.getByTestId('status-action')).toHaveTextContent('Learn more');
  });

  it('displays correct values for pages and sheets', () => {
    render(
      <PreviewTemplateDetailsAuthoringLetter
        template={{
          id: 'template-id',
          name: 'Example AUTHORING letter',
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: 'LETTER',
          letterType: 'x0',
          letterVersion: 'AUTHORING',
          letterVariantId: 'variant-123',
          sidesCount: 5,
          language: 'en',
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
      />
    );

    // Total pages = ceil(5/2) = 3
    expect(screen.getByText('3')).toBeInTheDocument();
    // Sheets = sidesCount = 5
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays printing and postage value', () => {
    render(
      <PreviewTemplateDetailsAuthoringLetter
        template={{
          id: 'template-id',
          name: 'Example AUTHORING letter',
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: 'LETTER',
          letterType: 'x0',
          letterVersion: 'AUTHORING',
          letterVariantId: 'my-variant-id',
          sidesCount: 2,
          language: 'en',
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
      />
    );

    expect(screen.getByText('my-variant-id')).toBeInTheDocument();
  });

  it('displays yellow background when letterVariantId is absent', () => {
    const { container } = render(
      <PreviewTemplateDetailsAuthoringLetter
        template={{
          id: 'template-id',
          name: 'Example AUTHORING letter',
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: 'LETTER',
          letterType: 'x0',
          letterVersion: 'AUTHORING',
          sidesCount: 2,
          language: 'en',
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
      />
    );

    // Verify the row has the missingValue class for yellow background
    const printingAndPostageRow = container.querySelector('.missingValue');
    expect(printingAndPostageRow).toBeInTheDocument();
  });

  it('matches snapshot when letterVariantId is absent', () => {
    const { asFragment } = render(
      <PreviewTemplateDetailsAuthoringLetter
        template={{
          id: 'template-id',
          name: 'Example AUTHORING letter without variant',
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: 'LETTER',
          letterType: 'x0',
          letterVersion: 'AUTHORING',
          sidesCount: 4,
          language: 'en',
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('hides status when hideStatus is true', () => {
    render(
      <PreviewTemplateDetailsAuthoringLetter
        template={{
          id: 'template-id',
          name: 'Example AUTHORING letter',
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: 'LETTER',
          letterType: 'x0',
          letterVersion: 'AUTHORING',
          letterVariantId: 'variant-123',
          sidesCount: 2,
          language: 'en',
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
        hideStatus
      />
    );

    expect(screen.queryByTestId('status-tag')).not.toBeInTheDocument();
  });

  it('displays locked template warning when routing enabled and status is SUBMITTED', () => {
    jest.mocked(useFeatureFlags).mockReturnValue({ routing: true });

    render(
      <PreviewTemplateDetailsAuthoringLetter
        template={{
          id: 'template-id',
          name: 'Submitted AUTHORING letter',
          templateStatus: 'SUBMITTED',
          templateType: 'LETTER',
          letterType: 'x0',
          letterVersion: 'AUTHORING',
          letterVariantId: 'variant-123',
          sidesCount: 2,
          language: 'en',
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
      />
    );

    expect(
      screen.getByText(/You cannot delete this template/i)
    ).toBeInTheDocument();
  });
});
