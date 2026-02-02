import PreviewTemplateDetailsAuthoringLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsAuthoringLetter';
import PreviewTemplateDetailsEmail from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsEmail';
import PreviewTemplateDetailsLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsLetter';
import PreviewTemplateDetailsPdfLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsPdfLetter';
import PreviewTemplateDetailsNhsApp from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsNhsApp';
import PreviewTemplateDetailsSms from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsSms';
import { render, screen } from '@testing-library/react';
import {
  useCampaignIds,
  useFeatureFlags,
} from '@providers/client-config-provider';
import {
  AuthoringLetterTemplate,
  PdfLetterTemplate,
} from 'nhs-notify-web-template-management-utils';

jest.mock('@providers/client-config-provider');

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(useFeatureFlags).mockReturnValue({ routing: false });
  jest.mocked(useCampaignIds).mockReturnValue(['campaign-1', 'campaign-2']);
});

const baseTemplate = {
  id: 'template-id',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
} as const;

const basePdfLetter: PdfLetterTemplate = {
  ...baseTemplate,
  name: 'PDF Letter',
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
};

const baseAuthoringLetter: AuthoringLetterTemplate = {
  ...baseTemplate,
  name: 'Authoring Letter',
  templateStatus: 'NOT_YET_SUBMITTED',
  templateType: 'LETTER',
  letterType: 'x0',
  letterVersion: 'AUTHORING',
  letterVariantId: 'variant-123',
  sidesCount: 4,
  language: 'en',
};

describe('PreviewTemplateDetailsNhsApp', () => {
  it('matches snapshot', () => {
    const container = render(
      <PreviewTemplateDetailsNhsApp
        template={{
          ...baseTemplate,
          name: 'Example template',
          message: 'app content',
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: 'NHS_APP',
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
          ...baseTemplate,
          name: 'Example Email template',
          message: 'email content',
          subject: 'email subject',
          templateStatus: 'SUBMITTED',
          templateType: 'EMAIL',
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
          ...baseTemplate,
          name: 'SMS template',
          message: 'SMS content',
          templateStatus: 'SUBMITTED',
          templateType: 'SMS',
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
          ...basePdfLetter,
          templateStatus: 'PENDING_VALIDATION',
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
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when test data CSV is absent', () => {
    const container = render(
      <PreviewTemplateDetailsPdfLetter template={basePdfLetter} />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot with proofs (failed virus scan proofs excluded)', () => {
    const container = render(
      <PreviewTemplateDetailsPdfLetter
        template={{
          ...basePdfLetter,
          clientId: 'client-id',
          templateStatus: 'PROOF_AVAILABLE',
          files: {
            ...basePdfLetter.files,
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
        }}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });
});

describe('PreviewTemplateDetailsAuthoringLetter', () => {
  it('matches snapshot', () => {
    const container = render(
      <PreviewTemplateDetailsAuthoringLetter template={baseAuthoringLetter} />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot without letterVariantId (shows missing value styling)', () => {
    const { letterVariantId: _, ...templateWithoutVariant } =
      baseAuthoringLetter;
    const container = render(
      <PreviewTemplateDetailsAuthoringLetter
        template={templateWithoutVariant}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
    expect(
      container.container.querySelector('.missingValue')
    ).toBeInTheDocument();
  });

  it('matches snapshot with hideActions', () => {
    const container = render(
      <PreviewTemplateDetailsAuthoringLetter
        template={{ ...baseAuthoringLetter, campaignId: 'campaign-123' }}
        hideActions
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
    expect(screen.queryByTestId('edit-name-link')).not.toBeInTheDocument();
    expect(screen.queryByTestId('campaign-action')).not.toBeInTheDocument();
  });

  it('hides status when hideStatus is true', () => {
    render(
      <PreviewTemplateDetailsAuthoringLetter
        template={baseAuthoringLetter}
        hideStatus
      />
    );

    expect(screen.queryByTestId('status-tag')).not.toBeInTheDocument();
  });

  it('displays locked template warning when routing enabled and status is SUBMITTED', () => {
    jest.mocked(useFeatureFlags).mockReturnValue({ routing: true });

    render(
      <PreviewTemplateDetailsAuthoringLetter
        template={{ ...baseAuthoringLetter, templateStatus: 'SUBMITTED' }}
      />
    );

    expect(
      screen.getByText(/you cannot delete this template/i)
    ).toBeInTheDocument();
  });

  it('hides campaign Edit link when client has single campaign', () => {
    jest.mocked(useCampaignIds).mockReturnValue(['single-campaign']);

    render(
      <PreviewTemplateDetailsAuthoringLetter
        template={{ ...baseAuthoringLetter, campaignId: 'single-campaign' }}
      />
    );

    expect(screen.getByText('single-campaign')).toBeInTheDocument();
    expect(screen.queryByTestId('campaign-action')).not.toBeInTheDocument();
  });

  it('shows campaign Edit link when client has multiple campaigns', () => {
    jest.mocked(useCampaignIds).mockReturnValue(['campaign-1', 'campaign-2']);

    render(
      <PreviewTemplateDetailsAuthoringLetter
        template={{ ...baseAuthoringLetter, campaignId: 'campaign-1' }}
      />
    );

    expect(screen.getByText('campaign-1')).toBeInTheDocument();
    expect(screen.getByTestId('campaign-action')).toBeInTheDocument();
  });

  it('shows campaign Edit link when campaignId is missing', () => {
    jest.mocked(useCampaignIds).mockReturnValue(['single-campaign']);

    render(
      <PreviewTemplateDetailsAuthoringLetter template={baseAuthoringLetter} />
    );

    expect(screen.getByTestId('campaign-action')).toBeInTheDocument();
    expect(
      screen.getByTestId('campaign-action').closest('.missingValue')
    ).toBeInTheDocument();
  });
});

describe('PreviewTemplateDetailsLetter', () => {
  it('renders PDF letter component for PDF letterVersion', () => {
    render(<PreviewTemplateDetailsLetter template={basePdfLetter} />);

    expect(screen.getByText('file.pdf')).toBeInTheDocument();
    expect(screen.queryByTestId('edit-name-link')).not.toBeInTheDocument();
  });

  it('renders authoring letter component for AUTHORING letterVersion', () => {
    render(<PreviewTemplateDetailsLetter template={baseAuthoringLetter} />);

    expect(screen.getByTestId('edit-name-link')).toBeInTheDocument();
    expect(screen.getByText('Sheets')).toBeInTheDocument();
  });

  it('passes hideStatus and hideActions props through', () => {
    render(
      <PreviewTemplateDetailsLetter
        template={{ ...baseAuthoringLetter, campaignId: 'campaign-123' }}
        hideStatus
        hideActions
      />
    );

    expect(screen.queryByTestId('status-tag')).not.toBeInTheDocument();
    expect(screen.queryByTestId('edit-name-link')).not.toBeInTheDocument();
    expect(screen.queryByTestId('campaign-action')).not.toBeInTheDocument();
  });
});
