import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LetterRenderTab } from '@molecules/LetterRender/LetterRenderTab';
import { updateLetterPreview } from '@molecules/LetterRender/server-action';
import type {
  AuthoringLetterTemplate,
  FormState,
} from 'nhs-notify-web-template-management-utils';
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

function createMockState(overrides: Partial<FormState> = {}): FormState {
  return {
    fields: {
      __systemPersonalisationPackId: '',
      appointmentDate: '',
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
      render(<LetterRenderTab template={baseTemplate} tab='shortFormRender' />);

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
            personalisationParameters: {
              firstName: 'Jo',
              lastName: 'Bloggs',
            },
            pageCount: 4,
          },
        },
      };

      render(
        <LetterRenderTab
          template={templateWithShortRender}
          tab='shortFormRender'
        />
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
            personalisationParameters: {
              firstName: 'Michael',
              lastName: 'Richardson-Clarke',
            },
            pageCount: 4,
          },
        },
      };

      render(
        <LetterRenderTab
          template={templateWithLongRender}
          tab='longFormRender'
        />
      );

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

      render(
        <LetterRenderTab template={templateNoRenders} tab='shortFormRender' />
      );

      expect(screen.getByText('No preview available')).toBeInTheDocument();
    });
  });

  describe('getInitialState', () => {
    it('uses initial empty state when no variant render exists', () => {
      render(<LetterRenderTab template={baseTemplate} tab='shortFormRender' />);

      const dropdown = screen.getByRole('combobox', {
        name: 'Example recipient',
      });

      expect(dropdown).toHaveValue('');
    });

    it('handles template with no customPersonalisation', () => {
      const templateWithoutCustom: AuthoringLetterTemplate = {
        ...baseTemplate,
        customPersonalisation: undefined,
      };

      render(
        <LetterRenderTab
          template={templateWithoutCustom}
          tab='shortFormRender'
        />
      );

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
            personalisationParameters: {
              firstName: 'Jo',
              lastName: 'Bloggs',
              appointmentDate: '2025-03-20',
            },
            pageCount: 4,
          },
        },
      };

      render(
        <LetterRenderTab
          template={templateWithShortRender}
          tab='shortFormRender'
        />
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
            personalisationParameters: {
              firstName: 'Elizabeth',
              lastName: 'Thompson',
              appointmentDate: '2025-04-15',
            },
            pageCount: 4,
          },
        },
      };

      render(
        <LetterRenderTab
          template={templateWithLongRender}
          tab='longFormRender'
        />
      );

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
      render(<LetterRenderTab template={baseTemplate} tab='shortFormRender' />);

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
        fields: {
          __systemPersonalisationPackId: '',
          appointmentDate: '',
        },
      } satisfies FormState);

      expect(formData.get('__systemPersonalisationPackId')).toBe('short-1');
      expect(formData.get('appointmentDate')).toBe('2025-06-15');
    });

    it('calls updateLetterPreview with form state and form data for long tab', async () => {
      render(<LetterRenderTab template={baseTemplate} tab='longFormRender' />);

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
        fields: {
          __systemPersonalisationPackId: '',
          appointmentDate: '',
        },
      } satisfies FormState);

      expect(formData.get('__systemPersonalisationPackId')).toBe('long-1');
      expect(formData.get('appointmentDate')).toBe('2025-07-20');
    });

    it('displays validation error when no recipient selected', async () => {
      mockUpdateLetterPreview.mockResolvedValue(
        createMockState({
          errorState: {
            formErrors: [],
            fieldErrors: {
              __systemPersonalisationPackId: ['Select an example recipient'],
            },
          },
        })
      );

      render(<LetterRenderTab template={baseTemplate} tab='shortFormRender' />);

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

  describe('snapshots', () => {
    it('matches snapshot for short tab', () => {
      const { asFragment } = render(
        <LetterRenderTab template={baseTemplate} tab='shortFormRender' />
      );

      expect(asFragment()).toMatchSnapshot();
    });

    it('matches snapshot for long tab', () => {
      const { asFragment } = render(
        <LetterRenderTab template={baseTemplate} tab='longFormRender' />
      );

      expect(asFragment()).toMatchSnapshot();
    });
  });
});
