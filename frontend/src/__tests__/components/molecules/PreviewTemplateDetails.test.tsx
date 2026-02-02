import PreviewTemplateDetailsAuthoringLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsAuthoringLetter';
import PreviewTemplateDetailsEmail from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsEmail';
import PreviewTemplateDetailsLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsLetter';
import PreviewTemplateDetailsPdfLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsPdfLetter';
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

describe('PreviewTemplateDetailsPdfLetter', () => {
  it('matches snapshot without proofs', () => {
    const container = render(
      <PreviewTemplateDetailsPdfLetter
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
      <PreviewTemplateDetailsPdfLetter
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
      <PreviewTemplateDetailsPdfLetter
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
      <PreviewTemplateDetailsPdfLetter
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
      <PreviewTemplateDetailsPdfLetter
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
      screen.getByText(/you cannot delete this template/i)
    ).toBeInTheDocument();
  });

  it('hides Edit name link when hideActions is true', () => {
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
        hideActions
      />
    );

    expect(screen.queryByTestId('edit-name-link')).not.toBeInTheDocument();
  });

  it('hides all action links in summary list rows when hideActions is true', () => {
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
        hideActions
      />
    );

    // All action links should be hidden
    expect(screen.queryByTestId('campaign-action')).not.toBeInTheDocument();
    expect(screen.queryByTestId('sheets-action')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('printing-postage-action')
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('status-action')).not.toBeInTheDocument();
  });

  it('matches snapshot when hideActions is true', () => {
    const { asFragment } = render(
      <PreviewTemplateDetailsAuthoringLetter
        template={{
          id: 'template-id',
          name: 'Example AUTHORING letter with hidden actions',
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
        hideActions
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PreviewTemplateDetailsLetter', () => {
  it('renders PreviewTemplateDetailsPdfLetter for PDF letterVersion', () => {
    render(
      <PreviewTemplateDetailsLetter
        template={{
          id: 'template-id',
          name: 'PDF Letter Template',
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

    // PDF letter shows template file row
    expect(screen.getByText('file.pdf')).toBeInTheDocument();
    // PDF letter does NOT show Edit name link
    expect(screen.queryByTestId('edit-name-link')).not.toBeInTheDocument();
  });

  it('renders PreviewTemplateDetailsAuthoringLetter for AUTHORING letterVersion', () => {
    render(
      <PreviewTemplateDetailsLetter
        template={{
          id: 'template-id',
          name: 'Authoring Letter Template',
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

    // Authoring letter shows Edit name link (when hideActions is not set)
    expect(screen.getByTestId('edit-name-link')).toBeInTheDocument();
    // Authoring letter shows sheets row
    expect(screen.getByText('Sheets')).toBeInTheDocument();
  });

  it('passes hideStatus prop to underlying components', () => {
    render(
      <PreviewTemplateDetailsLetter
        template={{
          id: 'template-id',
          name: 'Authoring Letter Template',
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

    // Status should be hidden
    expect(screen.queryByTestId('status-tag')).not.toBeInTheDocument();
  });

  it('passes hideActions prop to AuthoringLetter component', () => {
    render(
      <PreviewTemplateDetailsLetter
        template={{
          id: 'template-id',
          name: 'Authoring Letter Template',
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: 'LETTER',
          letterType: 'x0',
          letterVersion: 'AUTHORING',
          letterVariantId: 'variant-123',
          sidesCount: 2,
          language: 'en',
          campaignId: 'campaign-123',
          createdAt: '2025-01-13T10:19:25.579Z',
          updatedAt: '2025-01-13T10:19:25.579Z',
          lockNumber: 1,
        }}
        hideActions
      />
    );

    // Actions should be hidden
    expect(screen.queryByTestId('edit-name-link')).not.toBeInTheDocument();
    expect(screen.queryByTestId('campaign-action')).not.toBeInTheDocument();
    expect(screen.queryByTestId('sheets-action')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('printing-postage-action')
    ).not.toBeInTheDocument();
  });

  it('matches snapshot for PDF letter', () => {
    const { asFragment } = render(
      <PreviewTemplateDetailsLetter
        template={{
          id: 'template-id',
          name: 'PDF Letter via Adapter',
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

    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot for AUTHORING letter with hideActions', () => {
    const { asFragment } = render(
      <PreviewTemplateDetailsLetter
        template={{
          id: 'template-id',
          name: 'Authoring Letter via Adapter',
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
        hideActions
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
