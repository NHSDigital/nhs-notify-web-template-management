import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LetterRender } from '@molecules/LetterRender';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { updateLetterPreview } from '@molecules/LetterRender/server-action';

jest.mock('@molecules/LetterRender/server-action', () => ({
  updateLetterPreview: jest.fn(),
}));

jest.mock('@utils/get-base-path', () => ({
  getBasePath: jest.fn(() => '/templates'),
}));

const mockUpdateLetterPreview = updateLetterPreview as jest.MockedFunction<
  typeof updateLetterPreview
>;

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

  it('renders the section heading and guidance', () => {
    render(<LetterRender template={baseTemplate} />);

    expect(screen.getByText('Letter preview')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Check how your personalisation fields will appear in your letter.'
      )
    ).toBeInTheDocument();
  });

  it('renders tabs for short and long examples', () => {
    render(<LetterRender template={baseTemplate} />);

    expect(screen.getByText('Short examples')).toBeInTheDocument();
    expect(screen.getByText('Long examples')).toBeInTheDocument();
  });

  it('renders tab content for both tabs', () => {
    render(<LetterRender template={baseTemplate} />);

    // Both tab contents should be rendered (tabs component renders both, CSS hides inactive)
    const tabContents = screen.getAllByRole('tabpanel', { hidden: true });
    expect(tabContents).toHaveLength(2);
  });

  it('matches snapshot', () => {
    const container = render(<LetterRender template={baseTemplate} />);

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('handles template without shortFormRender or longFormRender', () => {
    render(<LetterRender template={baseTemplate} />);

    expect(screen.getByText('Letter preview')).toBeInTheDocument();
    expect(screen.getByText('Short examples')).toBeInTheDocument();
    expect(screen.getByText('Long examples')).toBeInTheDocument();
  });

  it('builds PDF URL from initialRender when variant render not available', () => {
    render(<LetterRender template={baseTemplate} />);

    const shortIframe = screen.getByTitle('Letter preview - short examples');
    const longIframe = screen.getByTitle('Letter preview - long examples');

    expect(shortIframe).toHaveAttribute(
      'src',
      expect.stringContaining(
        '/templates/files/client-123/renders/template-123/initial.pdf'
      )
    );
    expect(longIframe).toHaveAttribute(
      'src',
      expect.stringContaining(
        '/templates/files/client-123/renders/template-123/initial.pdf'
      )
    );
  });

  it('handles template without any render files (pdfUrl is null)', () => {
    const templateWithoutRenders: AuthoringLetterTemplate = {
      ...baseTemplate,
      files: {},
    };

    render(<LetterRender template={templateWithoutRenders} />);

    expect(screen.getByText('Letter preview')).toBeInTheDocument();

    const noPreviewMessages = screen.getAllByText('No preview available');
    expect(noPreviewMessages.length).toBe(2);
  });

  it('uses variant-specific render when available', () => {
    const templateWithVariantRender: AuthoringLetterTemplate = {
      ...baseTemplate,
      files: {
        initialRender: {
          fileName: 'initial.pdf',
          currentVersion: 'version-1',
          status: 'RENDERED',
          pageCount: 4,
        },
        shortFormRender: {
          fileName: 'short-render.pdf',
          currentVersion: 'version-2',
          status: 'RENDERED',
          systemPersonalisationPackId: 'short-1',
          personalisationParameters: { appointmentDate: '2025-01-15' },
          pageCount: 4,
        },
      },
    };

    render(<LetterRender template={templateWithVariantRender} />);

    const iframe = screen.getByTitle('Letter preview - short examples');
    expect(iframe).toHaveAttribute(
      'src',
      expect.stringContaining('short-render.pdf')
    );
  });

  describe('form submission', () => {
    it('calls updateLetterPreview when form is submitted for short tab', async () => {
      mockUpdateLetterPreview.mockResolvedValue(undefined);

      render(<LetterRender template={baseTemplate} />);

      const dropdown = screen.getAllByRole('combobox', {
        name: 'Example recipient',
      })[0];

      fireEvent.change(dropdown, { target: { value: 'short-1' } });

      const submitButtons = screen.getAllByRole('button', {
        name: 'Update preview',
      });

      fireEvent.click(submitButtons[0]);

      await waitFor(() => {
        expect(mockUpdateLetterPreview).toHaveBeenCalledWith(
          expect.objectContaining({
            templateId: 'template-123',
            lockNumber: 1,
            tab: 'short',
            systemPersonalisationPackId: 'short-1',
          })
        );
      });
    });

    it('calls updateLetterPreview when form is submitted for long tab', async () => {
      mockUpdateLetterPreview.mockResolvedValue(undefined);

      render(<LetterRender template={baseTemplate} />);

      const longTab = screen.getByRole('tab', { name: 'Long examples' });

      fireEvent.click(longTab);

      const dropdowns = screen.getAllByRole('combobox', {
        name: 'Example recipient',
      });

      const longDropdown = dropdowns[1];

      fireEvent.change(longDropdown, { target: { value: 'long-1' } });

      const submitButtons = screen.getAllByRole('button', {
        name: 'Update preview',
      });

      fireEvent.click(submitButtons[1]);

      await waitFor(() => {
        expect(mockUpdateLetterPreview).toHaveBeenCalledWith(
          expect.objectContaining({
            templateId: 'template-123',
            lockNumber: 1,
            tab: 'long',
            systemPersonalisationPackId: 'long-1',
          })
        );
      });
    });

    it('includes custom personalisation parameters in submission', async () => {
      mockUpdateLetterPreview.mockResolvedValue(undefined);

      render(<LetterRender template={baseTemplate} />);

      const appointmentInput = screen.getAllByLabelText('appointmentDate')[0];

      fireEvent.change(appointmentInput, { target: { value: '2025-03-15' } });

      const submitButtons = screen.getAllByRole('button', {
        name: 'Update preview',
      });

      fireEvent.click(submitButtons[0]);

      await waitFor(() => {
        expect(mockUpdateLetterPreview).toHaveBeenCalledWith({
          templateId: 'template-123',
          lockNumber: 1,
          tab: 'short',
          systemPersonalisationPackId: '',
          personalisation: {
            appointmentDate: '2025-03-15',
          },
        });
      });
    });

    it('merges recipient data with custom personalisation', async () => {
      mockUpdateLetterPreview.mockResolvedValue(undefined);

      render(<LetterRender template={baseTemplate} />);

      const dropdown = screen.getAllByRole('combobox', {
        name: 'Example recipient',
      })[0];
      fireEvent.change(dropdown, { target: { value: 'short-1' } });

      const appointmentInput = screen.getAllByLabelText('appointmentDate')[0];
      fireEvent.change(appointmentInput, { target: { value: '2025-03-15' } });

      const submitButtons = screen.getAllByRole('button', {
        name: 'Update preview',
      });

      fireEvent.click(submitButtons[0]);

      await waitFor(() => {
        expect(mockUpdateLetterPreview).toHaveBeenCalledWith({
          templateId: 'template-123',
          lockNumber: 1,
          tab: 'short',
          systemPersonalisationPackId: 'short-1',
          personalisation: {
            nhsNumber: '9728543751',
            firstName: 'Jo',
            lastName: 'Bloggs',
            fullName: 'Jo Bloggs',
            middleNames: '',
            namePrefix: '',
            nameSuffix: '',
            address_line_1: 'Jo Bloggs',
            address_line_2: '1 High Street',
            address_line_3: 'Leeds',
            address_line_4: 'West Yorkshire',
            address_line_5: 'LS1 1AA',
            address_line_6: '',
            address_line_7: '',
            appointmentDate: '2025-03-15',
          },
        });
      });
    });
  });
});
