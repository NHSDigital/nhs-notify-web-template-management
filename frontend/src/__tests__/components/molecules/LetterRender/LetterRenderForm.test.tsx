import { render, screen } from '@testing-library/react';
import { LetterRenderForm } from '@molecules/LetterRender/LetterRenderForm';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import {
  LetterRenderPollingProvider,
  useLetterRenderPolling,
} from '@providers/letter-render-polling-provider';
import { useLetterRenderError } from '@providers/letter-render-error-provider';
import type {
  AuthoringLetterTemplate,
  FormState,
} from 'nhs-notify-web-template-management-utils';

jest.mock('@providers/letter-render-polling-provider', () => {
  const actual = jest.requireActual(
    '@providers/letter-render-polling-provider'
  );
  return {
    ...actual,
    useLetterRenderPolling: jest.fn(actual.useLetterRenderPolling),
  };
});

jest.mock('@providers/letter-render-error-provider', () => ({
  useLetterRenderError: jest.fn(),
}));

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
      status: 'RENDERED',
      currentVersion: '1234',
      fileName: '1234.pdf',
      pageCount: 1,
    },
  },
  systemPersonalisation: ['firstName', 'lastName'],
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
};

const mockServerAction = jest.fn().mockResolvedValue({
  fields: {},
} satisfies FormState);

function createInitialFormState(overrides: Partial<FormState> = {}): FormState {
  return {
    fields: {},
    ...overrides,
  };
}

function renderWithProvider(
  form: React.ReactElement,
  initialState: FormState = createInitialFormState()
) {
  return render(
    <LetterRenderPollingProvider>
      <NHSNotifyFormProvider
        initialState={initialState}
        serverAction={mockServerAction}
      >
        {form}
      </NHSNotifyFormProvider>
    </LetterRenderPollingProvider>
  );
}

describe('LetterRenderForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useLetterRenderError).mockReturnValue({
      parentErrorState: undefined,
      setParentErrorState: jest.fn(),
      letterRenderErrorState: undefined,
      setLetterRenderErrorState: jest.fn(),
    });
  });

  describe('PDS personalisation section', () => {
    it('renders PDS recipient dropdown with short recipients for short tab', () => {
      renderWithProvider(
        <LetterRenderForm template={baseTemplate} tab='shortFormRender' />
      );

      const dropdown = screen.getByRole('combobox', {
        name: 'Example recipient',
      });

      expect(dropdown).toBeInTheDocument();

      expect(screen.getByText('Jo Bloggs')).toBeInTheDocument();
      expect(screen.getByText('Mr John Smith')).toBeInTheDocument();
      expect(screen.getByText('Ms Sarah Jones')).toBeInTheDocument();
    });

    it('renders PDS recipient dropdown with long recipients for long tab', () => {
      renderWithProvider(
        <LetterRenderForm template={baseTemplate} tab='longFormRender' />
      );

      const dropdown = screen.getByRole('combobox', {
        name: 'Example recipient',
      });

      expect(dropdown).toBeInTheDocument();

      expect(
        screen.getByText('Mr Michael James Richardson-Clarke')
      ).toBeInTheDocument();

      expect(
        screen.getByText('Dr Elizabeth Anne Thompson')
      ).toBeInTheDocument();

      expect(
        screen.getByText('Dame Catherine Elizabeth Montgomery')
      ).toBeInTheDocument();
    });
  });

  describe('Custom personalisation section', () => {
    it('renders custom personalisation fields when template has customPersonalisation', () => {
      const templateWithCustom: AuthoringLetterTemplate = {
        ...baseTemplate,
        customPersonalisation: ['appointmentDate', 'clinicName'],
      };

      renderWithProvider(
        <LetterRenderForm template={templateWithCustom} tab='shortFormRender' />
      );

      expect(
        screen.getByText('Custom personalisation fields')
      ).toBeInTheDocument();

      expect(screen.getByLabelText('appointmentDate')).toBeInTheDocument();
      expect(screen.getByLabelText('clinicName')).toBeInTheDocument();
    });

    it('does not render custom section when template has no customPersonalisation', () => {
      const templateWithoutCustom: AuthoringLetterTemplate = {
        ...baseTemplate,
        customPersonalisation: undefined,
      };

      renderWithProvider(
        <LetterRenderForm
          template={templateWithoutCustom}
          tab='shortFormRender'
        />
      );

      expect(
        screen.queryByText('Custom personalisation fields')
      ).not.toBeInTheDocument();
    });

    it('does not render custom section when customPersonalisation is empty', () => {
      const templateWithEmptyCustom: AuthoringLetterTemplate = {
        ...baseTemplate,
        customPersonalisation: [],
      };

      renderWithProvider(
        <LetterRenderForm
          template={templateWithEmptyCustom}
          tab='shortFormRender'
        />
      );

      expect(
        screen.queryByText('Custom personalisation fields')
      ).not.toBeInTheDocument();
    });
  });

  describe('form values from state', () => {
    it('displays selected PDS recipient from form state', () => {
      const initialState = createInitialFormState({
        fields: {
          systemPersonalisationPackId: 'short-1',
        },
      });

      renderWithProvider(
        <LetterRenderForm template={baseTemplate} tab='shortFormRender' />,
        initialState
      );

      const dropdown = screen.getByRole('combobox', {
        name: 'Example recipient',
      });

      expect(dropdown).toHaveValue('short-1');
    });

    it('displays custom field values from form state', () => {
      const templateWithCustom: AuthoringLetterTemplate = {
        ...baseTemplate,
        customPersonalisation: ['appointmentDate'],
      };

      const initialState = createInitialFormState({
        fields: {
          systemPersonalisationPackId: '',
          'personalisation|appointmentDate': '2025-01-15',
        },
      });

      renderWithProvider(
        <LetterRenderForm
          template={templateWithCustom}
          tab='shortFormRender'
        />,
        initialState
      );

      const input = screen.getByLabelText('appointmentDate');
      expect(input).toHaveValue('2025-01-15');
    });
  });

  describe('submit button', () => {
    it('renders the update preview button', () => {
      renderWithProvider(
        <LetterRenderForm template={baseTemplate} tab='shortFormRender' />
      );

      expect(
        screen.getByRole('button', { name: 'Update preview' })
      ).toBeInTheDocument();
    });

    it('renders the update preview button as enabled when no tab is polling', () => {
      renderWithProvider(
        <LetterRenderForm template={baseTemplate} tab='shortFormRender' />
      );

      const button = screen.getByRole('button', { name: 'Update preview' });
      expect(button).not.toBeDisabled();
    });

    it('renders the update preview button as disabled when a tab is polling', () => {
      jest.mocked(useLetterRenderPolling).mockReturnValueOnce({
        isAnyTabPolling: true,
        registerPolling: jest.fn(),
      });

      renderWithProvider(
        <LetterRenderForm template={baseTemplate} tab='shortFormRender' />
      );

      const button = screen.getByRole('button', { name: 'Update preview' });
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('error display', () => {
    it('displays error message and applies error styling when recipient has validation error (short tab)', () => {
      const initialState = createInitialFormState({
        errorState: {
          formErrors: [],
          fieldErrors: {
            'system-personalisation-pack-id-shortFormRender': [
              'Choose example recipient',
            ],
          },
        },
      });

      renderWithProvider(
        <LetterRenderForm template={baseTemplate} tab='shortFormRender' />,
        initialState
      );

      expect(screen.getByText('Choose example recipient')).toBeInTheDocument();

      const formGroup = screen
        .getByText('Choose example recipient')
        .closest('.nhsuk-form-group');

      expect(formGroup).toHaveClass('nhsuk-form-group--error');

      const select = screen.getByRole('combobox', {
        name: 'Example recipient',
      });

      expect(select).toHaveClass('nhsuk-select--error');
    });

    it('displays error message and applies error styling when recipient has validation error (long tab)', () => {
      const initialState = createInitialFormState({
        errorState: {
          formErrors: [],
          fieldErrors: {
            'system-personalisation-pack-id-longFormRender': [
              'Choose example recipient',
            ],
          },
        },
      });

      renderWithProvider(
        <LetterRenderForm template={baseTemplate} tab='longFormRender' />,
        initialState
      );

      expect(screen.getByText('Choose example recipient')).toBeInTheDocument();

      const formGroup = screen
        .getByText('Choose example recipient')
        .closest('.nhsuk-form-group');

      expect(formGroup).toHaveClass('nhsuk-form-group--error');

      const select = screen.getByRole('combobox', {
        name: 'Example recipient',
      });

      expect(select).toHaveClass('nhsuk-select--error');
    });

    it('displays inline error and applies error styling when a custom personalisation field is empty', () => {
      const templateWithCustom: AuthoringLetterTemplate = {
        ...baseTemplate,
        customPersonalisation: ['appointmentDate'],
      };

      const initialState = createInitialFormState({
        errorState: {
          formErrors: [],
          fieldErrors: {
            'custom-appointmentDate-shortFormRender': [
              'Enter example data for appointmentDate',
            ],
          },
        },
      });

      renderWithProvider(
        <LetterRenderForm
          template={templateWithCustom}
          tab='shortFormRender'
        />,
        initialState
      );

      expect(
        screen.getByText('Enter example data for appointmentDate')
      ).toBeInTheDocument();

      const formGroup = screen
        .getByText('Enter example data for appointmentDate')
        .closest('.nhsuk-form-group');

      expect(formGroup).toHaveClass('nhsuk-form-group--error');
    });
  });

  describe('snapshots', () => {
    it('matches snapshot for short tab', () => {
      const templateWithCustom: AuthoringLetterTemplate = {
        ...baseTemplate,
        customPersonalisation: ['appointmentDate', 'clinicName'],
      };

      const container = renderWithProvider(
        <LetterRenderForm template={templateWithCustom} tab='shortFormRender' />
      );

      expect(container.asFragment()).toMatchSnapshot();
    });

    it('matches snapshot for long tab', () => {
      const templateWithCustom: AuthoringLetterTemplate = {
        ...baseTemplate,
        customPersonalisation: ['appointmentDate'],
      };

      const container = renderWithProvider(
        <LetterRenderForm template={templateWithCustom} tab='longFormRender' />
      );

      expect(container.asFragment()).toMatchSnapshot();
    });

    it('matches snapshot without custom personalisation', () => {
      const container = renderWithProvider(
        <LetterRenderForm template={baseTemplate} tab='shortFormRender' />
      );

      expect(container.asFragment()).toMatchSnapshot();
    });

    it('matches snapshot with validation error', () => {
      const initialState = createInitialFormState({
        errorState: {
          formErrors: [],
          fieldErrors: {
            'system-personalisation-pack-id-shortFormRender': [
              'Choose example recipient',
            ],
          },
        },
      });

      const container = renderWithProvider(
        <LetterRenderForm template={baseTemplate} tab='shortFormRender' />,
        initialState
      );

      expect(container.asFragment()).toMatchSnapshot();
    });
  });
});
