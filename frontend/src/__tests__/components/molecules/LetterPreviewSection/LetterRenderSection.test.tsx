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

  it('renders tab content for both variants', () => {
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
    // Note: The page component controls whether LetterRender is rendered based on initialRender.
    // This test verifies the component renders correctly when it only has initialRender
    // (no short/long variant renders yet).
    render(<LetterRender template={baseTemplate} />);

    // Component should render with tabs and content
    expect(screen.getByText('Letter preview')).toBeInTheDocument();
    expect(screen.getByText('Short examples')).toBeInTheDocument();
    expect(screen.getByText('Long examples')).toBeInTheDocument();
  });

  it('builds PDF URL from initialRender when variant render not available', () => {
    render(<LetterRender template={baseTemplate} />);

    // The iframe should have the PDF URL built from initialRender
    const iframes = screen.getAllByTitle(/letter preview/i);
    expect(iframes.length).toBeGreaterThan(0);

    // Check that the iframe src contains the expected path
    const iframe = iframes[0];
    expect(iframe).toHaveAttribute(
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

    // Component should still render with tabs
    expect(screen.getByText('Letter preview')).toBeInTheDocument();

    // When there's no PDF, the "No preview available" message should be shown
    const noPreviewMessages = screen.getAllByText('No preview available');
    expect(noPreviewMessages.length).toBe(2); // One for each tab
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

    // Find the iframe in the short tab content
    const iframes = screen.getAllByTitle(/letter preview/i);
    expect(iframes.length).toBeGreaterThan(0);

    // The first iframe (short tab) should use the variant-specific render
    expect(iframes[0]).toHaveAttribute(
      'src',
      expect.stringContaining('short-render.pdf')
    );
  });

  describe('form submission', () => {
    it('calls updateLetterPreview when form is submitted for short tab', async () => {
      mockUpdateLetterPreview.mockResolvedValue(undefined);

      render(<LetterRender template={baseTemplate} />);

      // Select a recipient
      const dropdown = screen.getAllByRole('combobox', {
        name: /example recipient/i,
      })[0];
      fireEvent.change(dropdown, { target: { value: 'short-1' } });

      // Click the submit button
      const submitButtons = screen.getAllByRole('button', {
        name: 'Update preview',
      });
      fireEvent.click(submitButtons[0]);

      await waitFor(() => {
        expect(mockUpdateLetterPreview).toHaveBeenCalledWith(
          expect.objectContaining({
            templateId: 'template-123',
            tab: 'short',
            systemPersonalisationPackId: 'short-1',
          })
        );
      });
    });

    it('calls updateLetterPreview when form is submitted for long tab', async () => {
      mockUpdateLetterPreview.mockResolvedValue(undefined);

      render(<LetterRender template={baseTemplate} />);

      // Click the long tab
      const longTab = screen.getByRole('tab', { name: 'Long examples' });
      fireEvent.click(longTab);

      // Select a recipient in the long tab
      const dropdowns = screen.getAllByRole('combobox', {
        name: /example recipient/i,
      });
      const longDropdown = dropdowns[1];
      fireEvent.change(longDropdown, { target: { value: 'long-1' } });

      // Click the submit button in the long tab
      const submitButtons = screen.getAllByRole('button', {
        name: 'Update preview',
      });
      fireEvent.click(submitButtons[1]);

      await waitFor(() => {
        expect(mockUpdateLetterPreview).toHaveBeenCalledWith(
          expect.objectContaining({
            templateId: 'template-123',
            tab: 'long',
            systemPersonalisationPackId: 'long-1',
          })
        );
      });
    });

    it('includes custom personalisation parameters in submission', async () => {
      mockUpdateLetterPreview.mockResolvedValue(undefined);

      render(<LetterRender template={baseTemplate} />);

      // Fill in a custom personalisation field
      const appointmentInput = screen.getAllByLabelText('appointmentDate')[0];
      fireEvent.change(appointmentInput, { target: { value: '2025-03-15' } });

      // Click the submit button
      const submitButtons = screen.getAllByRole('button', {
        name: 'Update preview',
      });
      fireEvent.click(submitButtons[0]);

      await waitFor(() => {
        expect(mockUpdateLetterPreview).toHaveBeenCalledWith(
          expect.objectContaining({
            personalisation: expect.objectContaining({
              appointmentDate: '2025-03-15',
            }),
          })
        );
      });
    });

    it('merges recipient data with custom personalisation', async () => {
      mockUpdateLetterPreview.mockResolvedValue(undefined);

      render(<LetterRender template={baseTemplate} />);

      // Select a recipient
      const dropdown = screen.getAllByRole('combobox', {
        name: /example recipient/i,
      })[0];
      fireEvent.change(dropdown, { target: { value: 'short-1' } });

      // Fill in a custom personalisation field
      const appointmentInput = screen.getAllByLabelText('appointmentDate')[0];
      fireEvent.change(appointmentInput, { target: { value: '2025-03-15' } });

      // Click the submit button
      const submitButtons = screen.getAllByRole('button', {
        name: 'Update preview',
      });
      fireEvent.click(submitButtons[0]);

      await waitFor(() => {
        expect(mockUpdateLetterPreview).toHaveBeenCalledWith(
          expect.objectContaining({
            personalisation: expect.objectContaining({
              // From recipient data
              firstName: 'Jo',
              lastName: 'Bloggs',
              // From custom input
              appointmentDate: '2025-03-15',
            }),
          })
        );
      });
    });
  });
});
