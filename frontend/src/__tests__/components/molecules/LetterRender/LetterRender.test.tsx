import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { LetterRender } from '@molecules/LetterRender';
import { LetterRenderPollingProvider } from '@providers/letter-render-polling-provider';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { verifyFormCsrfToken } from '@utils/csrf-utils';

jest.mock('@utils/csrf-utils');
jest.mocked(verifyFormCsrfToken).mockResolvedValue(true);

jest.mock('@molecules/LetterRender/server-action');

jest.mock('@providers/letter-render-error-provider', () => ({
  useLetterRenderError: jest.fn(() => ({
    parentErrorState: undefined,
    setParentErrorState: jest.fn(),
    letterRenderErrorState: undefined,
    setLetterRenderErrorState: jest.fn(),
  })),
}));

jest.mock('next/navigation');

jest.mock('@utils/get-base-path', () => ({
  getBasePath: jest.fn(() => '/templates'),
}));

function Provider({ children }: PropsWithChildren) {
  return <LetterRenderPollingProvider>{children}</LetterRenderPollingProvider>;
}

const baseTemplate: AuthoringLetterTemplate = {
  id: 'template-123',
  clientId: 'client-123',
  name: 'Test Letter',
  templateStatus: 'NOT_YET_SUBMITTED',
  templateType: 'LETTER',
  letterType: 'x0',
  letterVersion: 'AUTHORING',
  letterVariantId: 'variant-123',
  language: 'en',
  files: {
    docxTemplate: {
      currentVersion: 'version-id',
      fileName: 'template.docx',
      virusScanStatus: 'PASSED',
    },
    initialRender: {
      fileName: 'initial.pdf',
      currentVersion: 'version-1',
      status: 'RENDERED',
      pageCount: 4,
    },
  },
  systemPersonalisation: ['firstName', 'lastName'],
  customPersonalisation: ['appointmentDate', 'clinicName'],
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
};

describe('LetterRender', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders tabs for short and long examples', () => {
    render(<LetterRender template={baseTemplate} />, { wrapper: Provider });

    expect(screen.getByText('Short examples')).toBeInTheDocument();
    expect(screen.getByText('Long examples')).toBeInTheDocument();
  });

  it('renders tab content for both tabs', () => {
    render(<LetterRender template={baseTemplate} />, { wrapper: Provider });

    // Both tab contents should be rendered (tabs component renders both, CSS hides inactive)
    const tabContents = screen.getAllByRole('tabpanel', { hidden: true });
    expect(tabContents).toHaveLength(2);
  });

  it('displays learn more about personalisation link', () => {
    render(<LetterRender template={baseTemplate} />, { wrapper: Provider });

    const link = screen.getByRole('link');

    expect(link).toHaveTextContent(
      'Learn more about personalising your letters (opens in a new tab).'
    );
    expect(link).toHaveProperty(
      'href',
      'https://notify.nhs.uk/using-nhs-notify/personalisation'
    );
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<LetterRender template={baseTemplate} />, {
      wrapper: Provider,
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when hideEditActions is true', () => {
    const { asFragment } = render(
      <LetterRender template={baseTemplate} hideEditActions />,
      {
        wrapper: Provider,
      }
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
