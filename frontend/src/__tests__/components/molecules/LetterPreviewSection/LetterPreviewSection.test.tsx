import { render, screen } from '@testing-library/react';
import { LetterPreviewSection } from '@molecules/LetterPreviewSection';
import { useNHSNotifyForm } from '@providers/form-provider';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';

// Mock the form provider including useNHSNotifyForm
jest.mock('@providers/form-provider', () => ({
  NHSNotifyFormProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='form-provider'>{children}</div>
  ),
  useNHSNotifyForm: jest.fn(),
}));

jest.mock('@molecules/LetterPreviewSection/server-action', () => ({
  updateLetterPreview: jest.fn(),
}));

jest.mock('@utils/get-base-path', () => ({
  getBasePath: jest.fn(() => '/templates'),
}));

const mockAction = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useNHSNotifyForm).mockReturnValue([
    {},
    mockAction,
    false,
  ]);
});

const baseTemplate: AuthoringLetterTemplate = {
  id: 'template-123',
  clientId: 'client-123',
  name: 'Test Letter',
  templateStatus: 'NOT_YET_SUBMITTED',
  templateType: 'LETTER',
  letterType: 'x0',
  letterVersion: 'AUTHORING',
  letterVariantId: 'variant-123',
  sidesCount: 4,
  language: 'en',
  files: {
    initialRender: {
      fileName: 'initial.pdf',
      currentVersion: 'version-1',
      status: 'RENDERED',
    },
  },
  pdsPersonalisation: ['firstName', 'lastName'],
  customPersonalisation: ['appointmentDate', 'clinicName'],
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
};

describe('LetterPreviewSection', () => {
  it('renders the section heading and guidance', () => {
    render(<LetterPreviewSection template={baseTemplate} />);

    expect(screen.getByText('Letter preview')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Check how your personalisation fields will appear in your letter.'
      )
    ).toBeInTheDocument();
  });

  it('renders the learn more link', () => {
    render(<LetterPreviewSection template={baseTemplate} />);

    const link = screen.getByText(
      'Learn more about personalising your letters (opens in a new tab)'
    );
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      'https://notify.nhs.uk/using-nhs-notify/personalisation'
    );
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders tabs for short and long examples', () => {
    render(<LetterPreviewSection template={baseTemplate} />);

    expect(screen.getByText('Short examples')).toBeInTheDocument();
    expect(screen.getByText('Long examples')).toBeInTheDocument();
  });

  it('renders two form providers for each tab', () => {
    render(<LetterPreviewSection template={baseTemplate} />);

    const formProviders = screen.getAllByTestId('form-provider');
    expect(formProviders).toHaveLength(2);
  });

  it('matches snapshot', () => {
    const container = render(<LetterPreviewSection template={baseTemplate} />);

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('handles template without shortFormRender or longFormRender', () => {
    const templateWithoutRenders: AuthoringLetterTemplate = {
      ...baseTemplate,
      files: {},
    };

    render(<LetterPreviewSection template={templateWithoutRenders} />);

    expect(screen.getByText('Letter preview')).toBeInTheDocument();
    expect(screen.getByText('Short examples')).toBeInTheDocument();
    expect(screen.getByText('Long examples')).toBeInTheDocument();
  });
});
