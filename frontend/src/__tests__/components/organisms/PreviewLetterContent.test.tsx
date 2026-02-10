import { render, screen } from '@testing-library/react';
import { PreviewLetterContent } from '@organisms/PreviewLetterTemplate/PreviewLetterContent';
import {
  useCampaignIds,
  useFeatureFlags,
} from '@providers/client-config-provider';
import type { PdfLetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock('@providers/client-config-provider');

const baseTemplate: PdfLetterTemplate = {
  id: 'template-123',
  name: 'Test Letter',
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
  proofingEnabled: true,
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
};

describe('PreviewLetterContent', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useFeatureFlags).mockReturnValue({ routing: false });
    jest.mocked(useCampaignIds).mockReturnValue(['campaign-1', 'campaign-2']);
  });

  it('renders template details', () => {
    render(<PreviewLetterContent template={baseTemplate} />);

    expect(screen.getByText('Test Letter')).toBeInTheDocument();
  });

  it('renders submit button for NOT_YET_SUBMITTED status', () => {
    render(<PreviewLetterContent template={baseTemplate} />);

    expect(screen.getByText('Submit template')).toBeInTheDocument();
  });

  it('renders request proof button for PENDING_PROOF_REQUEST status', () => {
    const template: PdfLetterTemplate = {
      ...baseTemplate,
      templateStatus: 'PENDING_PROOF_REQUEST',
    };

    render(<PreviewLetterContent template={template} />);

    expect(screen.getByText('Request a proof')).toBeInTheDocument();
  });

  it('renders submit button for PROOF_AVAILABLE status when routing is disabled', () => {
    const template: PdfLetterTemplate = {
      ...baseTemplate,
      templateStatus: 'PROOF_AVAILABLE',
      files: {
        ...baseTemplate.files,
        proofs: {
          'proof.pdf': {
            fileName: 'proof.pdf',
            virusScanStatus: 'PASSED',
            supplier: 'MBA',
          },
        },
      },
    };

    render(<PreviewLetterContent template={template} />);

    expect(screen.getByText('Submit template')).toBeInTheDocument();
  });

  it('renders approve proof button for PROOF_AVAILABLE status when routing is enabled', () => {
    jest.mocked(useFeatureFlags).mockReturnValue({ routing: true });

    const template: PdfLetterTemplate = {
      ...baseTemplate,
      templateStatus: 'PROOF_AVAILABLE',
      files: {
        ...baseTemplate.files,
        proofs: {
          'proof.pdf': {
            fileName: 'proof.pdf',
            virusScanStatus: 'PASSED',
            supplier: 'MBA',
          },
        },
      },
    };

    render(<PreviewLetterContent template={template} />);

    expect(screen.getByText('Approve template proof')).toBeInTheDocument();
  });

  it('renders template details for error statuses (error summary handled by page)', () => {
    const template: PdfLetterTemplate = {
      ...baseTemplate,
      templateStatus: 'VIRUS_SCAN_FAILED',
    };

    render(<PreviewLetterContent template={template} />);

    // Component just renders template details, error summary is handled by page-level provider
    expect(screen.getByText('Test Letter')).toBeInTheDocument();
  });

  it('shows RTL warning when template language is right-to-left', () => {
    const template: PdfLetterTemplate = {
      ...baseTemplate,
      language: 'ar',
    };

    render(<PreviewLetterContent template={template} />);

    expect(screen.getByTestId('rtl-language-warning')).toBeInTheDocument();
  });

  it('matches snapshot for NOT_YET_SUBMITTED status', () => {
    const { container } = render(
      <PreviewLetterContent template={baseTemplate} />
    );

    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for PROOF_AVAILABLE status', () => {
    const template: PdfLetterTemplate = {
      ...baseTemplate,
      templateStatus: 'PROOF_AVAILABLE',
      clientId: 'client-123',
      files: {
        ...baseTemplate.files,
        proofs: {
          'proof.pdf': {
            fileName: 'proof.pdf',
            virusScanStatus: 'PASSED',
            supplier: 'MBA',
          },
        },
      },
    };

    const { container } = render(<PreviewLetterContent template={template} />);

    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for RTL language', () => {
    const template: PdfLetterTemplate = {
      ...baseTemplate,
      language: 'ar',
    };

    const { container } = render(<PreviewLetterContent template={template} />);

    expect(container).toMatchSnapshot();
  });
});
