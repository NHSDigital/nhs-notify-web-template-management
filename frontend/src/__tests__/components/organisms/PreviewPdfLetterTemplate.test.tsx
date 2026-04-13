import { render, screen } from '@testing-library/react';
import { PreviewPdfLetterTemplate } from '@organisms/PreviewPdfLetterTemplate/PreviewPdfLetterTemplate';
import type { PdfLetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock('@utils/get-base-path', () => ({
  getBasePath: jest.fn(() => '/templates'),
}));

jest.mock('@providers/client-config-provider', () => ({
  useFeatureFlags: jest.fn(() => ({ routing: false })),
}));

const baseTemplate: PdfLetterTemplate = {
  id: 'template-123',
  name: 'Test Letter Template',
  templateStatus: 'NOT_YET_SUBMITTED',
  templateType: 'LETTER',
  letterType: 'x0',
  letterVersion: 'PDF',
  language: 'en',
  files: {
    pdfTemplate: {
      fileName: 'template.pdf',
      currentVersion: 'version-1',
      virusScanStatus: 'PASSED',
    },
  },
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
};

describe('PreviewPdfLetterTemplate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the back link', () => {
    render(<PreviewPdfLetterTemplate template={baseTemplate} />);

    const backLinks = screen.getAllByText('Back to all templates');
    expect(backLinks.length).toBeGreaterThan(0);
  });

  it('renders the submit button for NOT_YET_SUBMITTED status', () => {
    render(<PreviewPdfLetterTemplate template={baseTemplate} />);

    const button = screen.getByTestId('preview-letter-template-cta');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Submit template');
  });

  it('renders the request proof button for PENDING_PROOF_REQUEST status', () => {
    const template: PdfLetterTemplate = {
      ...baseTemplate,
      templateStatus: 'PENDING_PROOF_REQUEST',
    };

    render(<PreviewPdfLetterTemplate template={template} />);

    const button = screen.getByTestId('preview-letter-template-cta');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Request a proof');
  });

  it('renders the submit button for PROOF_AVAILABLE status', () => {
    const template: PdfLetterTemplate = {
      ...baseTemplate,
      templateStatus: 'PROOF_AVAILABLE',
    };

    render(<PreviewPdfLetterTemplate template={template} />);

    const button = screen.getByTestId('preview-letter-template-cta');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Submit template');
  });

  it('shows pre-submission details for PROOF_AVAILABLE status', () => {
    const template: PdfLetterTemplate = {
      ...baseTemplate,
      templateStatus: 'PROOF_AVAILABLE',
    };

    render(<PreviewPdfLetterTemplate template={template} />);

    expect(
      screen.getByText('If this proof does not match the template')
    ).toBeInTheDocument();
    expect(
      screen.getByText('If you need to edit the template')
    ).toBeInTheDocument();
  });

  it('shows error summary for VIRUS_SCAN_FAILED status', () => {
    const template: PdfLetterTemplate = {
      ...baseTemplate,
      templateStatus: 'VIRUS_SCAN_FAILED',
    };

    render(<PreviewPdfLetterTemplate template={template} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows error summary for VALIDATION_FAILED status', () => {
    const template: PdfLetterTemplate = {
      ...baseTemplate,
      templateStatus: 'VALIDATION_FAILED',
    };

    render(<PreviewPdfLetterTemplate template={template} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('does not show error summary for normal statuses', () => {
    render(<PreviewPdfLetterTemplate template={baseTemplate} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not render button for statuses not in buttonMap', () => {
    const template: PdfLetterTemplate = {
      ...baseTemplate,
      templateStatus: 'SUBMITTED',
    };

    render(<PreviewPdfLetterTemplate template={template} />);

    expect(
      screen.queryByTestId('preview-letter-template-cta')
    ).not.toBeInTheDocument();
  });

  it('shows RTL warning for right-to-left languages', () => {
    const template: PdfLetterTemplate = {
      ...baseTemplate,
      language: 'ar',
    };

    render(<PreviewPdfLetterTemplate template={template} />);

    expect(screen.getByTestId('rtl-language-warning')).toBeInTheDocument();
  });

  it('does not show RTL warning for left-to-right languages', () => {
    render(<PreviewPdfLetterTemplate template={baseTemplate} />);

    expect(
      screen.queryByTestId('rtl-language-warning')
    ).not.toBeInTheDocument();
  });

  it('shows footer text when available for the status', () => {
    const template: PdfLetterTemplate = {
      ...baseTemplate,
      templateStatus: 'WAITING_FOR_PROOF',
    };

    render(<PreviewPdfLetterTemplate template={template} />);

    // Check for footer content - the exact text depends on content.ts
    const footer = document.querySelector('.preview-letter-footer');
    expect(footer).toBeInTheDocument();
  });

  it('does not show footer text when not available for the status', () => {
    render(<PreviewPdfLetterTemplate template={baseTemplate} />);

    // NOT_YET_SUBMITTED has no footer
    const footer = document.querySelector('.preview-letter-footer');
    expect(footer).not.toBeInTheDocument();
  });

  describe('with proofing feature flag enabled', () => {
    beforeEach(() => {
      const { useFeatureFlags } = jest.requireMock(
        '@providers/client-config-provider'
      );
      useFeatureFlags.mockReturnValue({ proofing: true });
    });

    it('renders approve button text for PROOF_AVAILABLE status', () => {
      const template: PdfLetterTemplate = {
        ...baseTemplate,
        templateStatus: 'PROOF_AVAILABLE',
      };

      render(<PreviewPdfLetterTemplate template={template} />);

      const button = screen.getByTestId('preview-letter-template-cta');
      expect(button).toHaveTextContent('Approve template proof');
    });
  });
});
