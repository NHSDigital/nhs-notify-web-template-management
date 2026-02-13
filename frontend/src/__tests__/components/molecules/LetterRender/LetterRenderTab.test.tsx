import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LetterRenderTab } from '@molecules/LetterRender/LetterRenderTab';
import { updateLetterPreview } from '@molecules/LetterRender/server-action';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import type { LetterRenderFormState } from '@molecules/LetterRender/types';
import { verifyFormCsrfToken } from '@utils/csrf-utils';

jest.mock('@utils/csrf-utils');
jest.mocked(verifyFormCsrfToken).mockResolvedValue(true);

jest.mock('@molecules/LetterRender/server-action');

jest.mock('@utils/get-base-path', () => ({
  getBasePath: jest.fn(() => '/templates'),
}));

const mockUpdateLetterPreview = jest.mocked(updateLetterPreview);

const baseTemplate: AuthoringLetterTemplate = {
  id: 'template-123',
  clientId: 'client-456',
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
  customPersonalisation: ['appointmentDate'],
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
};

function createMockState(
  overrides: Partial<LetterRenderFormState> = {}
): LetterRenderFormState {
  return {
    templateId: 'template-123',
    lockNumber: 1,
    tab: 'short',
    customPersonalisationFields: ['appointmentDate'],
    fields: {
      systemPersonalisationPackId: '',
      custom_appointmentDate: '',
    },
    ...overrides,
  };
}

describe('LetterRenderTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateLetterPreview.mockResolvedValue(createMockState());
  });

  describe('buildPdfUrl', () => {
    it('builds URL from initialRender when no variant render exists', () => {
      render(<LetterRenderTab template={baseTemplate} tab='short' />);

      const iframe = screen.getByTitle('Letter preview - short examples');
      expect(iframe).toHaveAttribute(
        'src',
        '/templates/files/client-456/renders/template-123/initial.pdf'
      );
    });

    it('builds URL from shortFormRender when available', () => {
      const templateWithShortRender: AuthoringLetterTemplate = {
        ...baseTemplate,
        files: {
          ...baseTemplate.files,
          shortFormRender: {
            fileName: 'short-render.pdf',
            currentVersion: 'version-2',
            status: 'RENDERED',
            systemPersonalisationPackId: 'short-1',
            personalisationParameters: {},
            pageCount: 4,
          },
        },
      };

      render(
        <LetterRenderTab template={templateWithShortRender} tab='short' />
      );

      const iframe = screen.getByTitle('Letter preview - short examples');
      expect(iframe).toHaveAttribute(
        'src',
        '/templates/files/client-456/renders/template-123/short-render.pdf'
      );
    });

    it('builds URL from longFormRender when available', () => {
      const templateWithLongRender: AuthoringLetterTemplate = {
        ...baseTemplate,
        files: {
          ...baseTemplate.files,
          longFormRender: {
            fileName: 'long-render.pdf',
            currentVersion: 'version-3',
            status: 'RENDERED',
            systemPersonalisationPackId: 'long-1',
            personalisationParameters: {},
            pageCount: 4,
          },
        },
      };

      render(<LetterRenderTab template={templateWithLongRender} tab='long' />);

      const iframe = screen.getByTitle('Letter preview - long examples');
      expect(iframe).toHaveAttribute(
        'src',
        '/templates/files/client-456/renders/template-123/long-render.pdf'
      );
    });

    it('returns null URL when no renders exist', () => {
      const templateNoRenders: AuthoringLetterTemplate = {
        ...baseTemplate,
        files: {},
      };

      render(<LetterRenderTab template={templateNoRenders} tab='short' />);

      expect(screen.getByText('No preview available')).toBeInTheDocument();
    });
  });

  describe('getInitialState', () => {
    it('uses initial empty state when no variant render exists', () => {
      render(<LetterRenderTab template={baseTemplate} tab='short' />);

      const dropdown = screen.getByRole('combobox', {
        name: 'Example recipient',
      });
      expect(dropdown).toHaveValue('');
    });

    it('uses stored systemPersonalisationPackId from shortFormRender', () => {
      const templateWithShortRender: AuthoringLetterTemplate = {
        ...baseTemplate,
        files: {
          ...baseTemplate.files,
          shortFormRender: {
            fileName: 'short-render.pdf',
            currentVersion: 'version-2',
            status: 'RENDERED',
            systemPersonalisationPackId: 'short-1',
            personalisationParameters: { appointmentDate: '2025-03-20' },
            pageCount: 4,
          },
        },
      };

      render(
        <LetterRenderTab template={templateWithShortRender} tab='short' />
      );

      const dropdown = screen.getByRole('combobox', {
        name: 'Example recipient',
      });
      expect(dropdown).toHaveValue('short-1');

      const appointmentInput = screen.getByLabelText('appointmentDate');
      expect(appointmentInput).toHaveValue('2025-03-20');
    });

    it('uses stored state from longFormRender for long tab', () => {
      const templateWithLongRender: AuthoringLetterTemplate = {
        ...baseTemplate,
        files: {
          ...baseTemplate.files,
          longFormRender: {
            fileName: 'long-render.pdf',
            currentVersion: 'version-3',
            status: 'RENDERED',
            systemPersonalisationPackId: 'long-2',
            personalisationParameters: { appointmentDate: '2025-04-15' },
            pageCount: 4,
          },
        },
      };

      render(<LetterRenderTab template={templateWithLongRender} tab='long' />);

      const dropdown = screen.getByRole('combobox', {
        name: 'Example recipient',
      });
      expect(dropdown).toHaveValue('long-2');

      const appointmentInput = screen.getByLabelText('appointmentDate');
      expect(appointmentInput).toHaveValue('2025-04-15');
    });
  });

  describe('form submission', () => {
    it('calls updateLetterPreview with form state and form data for short tab', async () => {
      render(<LetterRenderTab template={baseTemplate} tab='short' />);

      const dropdown = screen.getByRole('combobox', {
        name: 'Example recipient',
      });

      fireEvent.change(dropdown, { target: { value: 'short-1' } });

      const appointmentInput = screen.getByLabelText('appointmentDate');
      fireEvent.change(appointmentInput, { target: { value: '2025-06-15' } });

      const submitButton = screen.getByRole('button', {
        name: 'Update preview',
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateLetterPreview).toHaveBeenCalledTimes(1);
      });

      const [formState, formData] = mockUpdateLetterPreview.mock.calls[0];

      expect(formState).toEqual({
        templateId: 'template-123',
        lockNumber: 1,
        tab: 'short',
        customPersonalisationFields: ['appointmentDate'],
        fields: {
          systemPersonalisationPackId: '',
          custom_appointmentDate: '',
        },
      });

      expect(formData.get('systemPersonalisationPackId')).toBe('short-1');
      expect(formData.get('custom_appointmentDate')).toBe('2025-06-15');
    });

    it('calls updateLetterPreview with form state and form data for long tab', async () => {
      mockUpdateLetterPreview.mockResolvedValue(
        createMockState({ tab: 'long' })
      );

      render(<LetterRenderTab template={baseTemplate} tab='long' />);

      const dropdown = screen.getByRole('combobox', {
        name: 'Example recipient',
      });
      fireEvent.change(dropdown, { target: { value: 'long-1' } });

      const appointmentInput = screen.getByLabelText('appointmentDate');
      fireEvent.change(appointmentInput, { target: { value: '2025-07-20' } });

      const submitButton = screen.getByRole('button', {
        name: 'Update preview',
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateLetterPreview).toHaveBeenCalledTimes(1);
      });

      const [formState, formData] = mockUpdateLetterPreview.mock.calls[0];

      expect(formState).toEqual({
        templateId: 'template-123',
        lockNumber: 1,
        tab: 'long',
        customPersonalisationFields: ['appointmentDate'],
        fields: {
          systemPersonalisationPackId: '',
          custom_appointmentDate: '',
        },
      });

      expect(formData.get('systemPersonalisationPackId')).toBe('long-1');
      expect(formData.get('custom_appointmentDate')).toBe('2025-07-20');
    });

    it('displays validation error when no recipient selected', async () => {
      mockUpdateLetterPreview.mockResolvedValue(
        createMockState({
          errorState: {
            formErrors: [],
            fieldErrors: {
              systemPersonalisationPackId: ['Select an example recipient'],
            },
          },
        })
      );

      render(<LetterRenderTab template={baseTemplate} tab='short' />);

      const submitButton = screen.getByRole('button', {
        name: 'Update preview',
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateLetterPreview).toHaveBeenCalledTimes(1);
      });

      expect(
        await screen.findByText('Select an example recipient')
      ).toBeInTheDocument();
    });
  });

  describe('layout', () => {
    it('renders form and iframe in grid layout', () => {
      const { container } = render(
        <LetterRenderTab template={baseTemplate} tab='short' />
      );

      const gridRow = container.querySelector('.nhsuk-grid-row');
      expect(gridRow).toBeInTheDocument();

      const oneThirdColumn = container.querySelector(
        '.nhsuk-grid-column-one-third'
      );
      expect(oneThirdColumn).toBeInTheDocument();

      const twoThirdsColumn = container.querySelector(
        '.nhsuk-grid-column-two-thirds'
      );
      expect(twoThirdsColumn).toBeInTheDocument();
    });

    it('renders LetterRenderForm in one-third column', () => {
      const { container } = render(
        <LetterRenderTab template={baseTemplate} tab='short' />
      );

      const oneThirdColumn = container.querySelector(
        '.nhsuk-grid-column-one-third'
      );
      const form = oneThirdColumn?.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('renders LetterRenderIframe in two-thirds column', () => {
      const { container } = render(
        <LetterRenderTab template={baseTemplate} tab='short' />
      );

      const twoThirdsColumn = container.querySelector(
        '.nhsuk-grid-column-two-thirds'
      );
      const iframe = twoThirdsColumn?.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
    });
  });

  describe('tab-specific form IDs', () => {
    it('renders form with short tab ID', () => {
      const { container } = render(
        <LetterRenderTab template={baseTemplate} tab='short' />
      );

      const formIdInput = container.querySelector(
        'input[name="form-id"][value="letter-preview-short"]'
      );
      expect(formIdInput).toBeInTheDocument();
    });

    it('renders form with long tab ID', () => {
      const { container } = render(
        <LetterRenderTab template={baseTemplate} tab='long' />
      );

      const formIdInput = container.querySelector(
        'input[name="form-id"][value="letter-preview-long"]'
      );
      expect(formIdInput).toBeInTheDocument();
    });
  });
});
