import { render, screen } from '@testing-library/react';
import { LetterPreviewForm } from '@molecules/LetterPreviewSection/LetterPreviewForm';
import { useNHSNotifyForm } from '@providers/form-provider';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import type { LetterPreviewFormState } from '@molecules/LetterPreviewSection/types';

jest.mock('@providers/form-provider');
jest.mock('@utils/csrf-utils', () => ({
  verifyFormCsrfToken: jest.fn().mockResolvedValue(true),
}));

const mockAction = jest.fn();
const defaultFormState: LetterPreviewFormState = {
  templateId: 'template-123',
  variant: 'short',
  pdsPersonalisationPackId: '',
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useNHSNotifyForm).mockReturnValue([defaultFormState, mockAction, false]);
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
  files: {},
  pdsPersonalisation: ['firstName', 'lastName'],
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
};

describe('LetterPreviewForm', () => {
  describe('PDS personalisation section', () => {
    it('renders the PDS section heading and hint', () => {
      render(<LetterPreviewForm template={baseTemplate} variant='short' />);

      expect(screen.getByText('PDS personalisation fields')).toBeInTheDocument();
      expect(
        screen.getByText(
          'The PDS fields will be pre-filled with example data when you choose a test recipient.'
        )
      ).toBeInTheDocument();
    });

    it('renders PDS recipient dropdown with short recipients for short variant', () => {
      render(<LetterPreviewForm template={baseTemplate} variant='short' />);

      const dropdown = screen.getByRole('combobox', { name: /example recipient/i });
      expect(dropdown).toBeInTheDocument();

      // Check for short recipient options
      expect(screen.getByText('Jo Blogs')).toBeInTheDocument();
      expect(screen.getByText('Dr Li Wei')).toBeInTheDocument();
      expect(screen.getByText('Mx Ana Kim')).toBeInTheDocument();
    });

    it('renders PDS recipient dropdown with long recipients for long variant', () => {
      render(<LetterPreviewForm template={baseTemplate} variant='long' />);

      const dropdown = screen.getByRole('combobox', { name: /example recipient/i });
      expect(dropdown).toBeInTheDocument();

      // Check for long recipient options
      expect(screen.getByText('Joseph Anthony Hendrington-Bloggs')).toBeInTheDocument();
      expect(screen.getByText('Dr Alejandro Ruiz Fernandez')).toBeInTheDocument();
      expect(screen.getByText('Prof Catherine Montgomery-Harrington')).toBeInTheDocument();
    });

    it('displays error message when PDS field has error', () => {
      jest.mocked(useNHSNotifyForm).mockReturnValueOnce([
        {
          ...defaultFormState,
          errorState: {
            fieldErrors: {
              pdsPersonalisationPackId: ['Please select a recipient'],
            },
          },
        },
        mockAction,
        false,
      ]);

      render(<LetterPreviewForm template={baseTemplate} variant='short' />);

      expect(screen.getByText('Please select a recipient')).toBeInTheDocument();
    });
  });

  describe('Custom personalisation section', () => {
    it('renders custom personalisation fields when template has customPersonalisation', () => {
      const templateWithCustom: AuthoringLetterTemplate = {
        ...baseTemplate,
        customPersonalisation: ['appointmentDate', 'clinicName'],
      };

      render(<LetterPreviewForm template={templateWithCustom} variant='short' />);

      expect(screen.getByText('Custom personalisation fields')).toBeInTheDocument();
      expect(screen.getByLabelText('appointmentDate')).toBeInTheDocument();
      expect(screen.getByLabelText('clinicName')).toBeInTheDocument();
    });

    it('does not render custom section when template has no customPersonalisation', () => {
      const templateWithoutCustom: AuthoringLetterTemplate = {
        ...baseTemplate,
        customPersonalisation: undefined,
      };

      render(<LetterPreviewForm template={templateWithoutCustom} variant='short' />);

      expect(screen.queryByText('Custom personalisation fields')).not.toBeInTheDocument();
    });

    it('does not render custom section when customPersonalisation is empty', () => {
      const templateWithEmptyCustom: AuthoringLetterTemplate = {
        ...baseTemplate,
        customPersonalisation: [],
      };

      render(<LetterPreviewForm template={templateWithEmptyCustom} variant='short' />);

      expect(screen.queryByText('Custom personalisation fields')).not.toBeInTheDocument();
    });

    it('displays error for custom field', () => {
      jest.mocked(useNHSNotifyForm).mockReturnValueOnce([
        {
          ...defaultFormState,
          errorState: {
            fieldErrors: {
              custom_appointmentDate: ['Field is required'],
            },
          },
        },
        mockAction,
        false,
      ]);

      const templateWithCustom: AuthoringLetterTemplate = {
        ...baseTemplate,
        customPersonalisation: ['appointmentDate'],
      };

      render(<LetterPreviewForm template={templateWithCustom} variant='short' />);

      expect(screen.getByText('Field is required')).toBeInTheDocument();
    });
  });

  describe('hidden fields', () => {
    it('includes hidden templateId field', () => {
      render(<LetterPreviewForm template={baseTemplate} variant='short' />);

      const hiddenField = document.querySelector('input[name="templateId"]');
      expect(hiddenField).toHaveValue('template-123');
    });

    it('includes hidden variant field', () => {
      render(<LetterPreviewForm template={baseTemplate} variant='long' />);

      const hiddenField = document.querySelector('input[name="variant"]');
      expect(hiddenField).toHaveValue('long');
    });

    it('includes hidden lockNumber field', () => {
      render(<LetterPreviewForm template={baseTemplate} variant='short' />);

      const hiddenField = document.querySelector('input[name="lockNumber"]');
      expect(hiddenField).toHaveValue('1');
    });
  });

  describe('submit button', () => {
    it('renders the update preview button', () => {
      render(<LetterPreviewForm template={baseTemplate} variant='short' />);

      expect(screen.getByRole('button', { name: 'Update preview' })).toBeInTheDocument();
    });
  });

  describe('snapshots', () => {
    it('matches snapshot for short variant', () => {
      const templateWithCustom: AuthoringLetterTemplate = {
        ...baseTemplate,
        customPersonalisation: ['appointmentDate', 'clinicName'],
      };

      const container = render(
        <LetterPreviewForm template={templateWithCustom} variant='short' />
      );

      expect(container.asFragment()).toMatchSnapshot();
    });

    it('matches snapshot for long variant', () => {
      const templateWithCustom: AuthoringLetterTemplate = {
        ...baseTemplate,
        customPersonalisation: ['appointmentDate'],
      };

      const container = render(
        <LetterPreviewForm template={templateWithCustom} variant='long' />
      );

      expect(container.asFragment()).toMatchSnapshot();
    });

    it('matches snapshot without custom personalisation', () => {
      const container = render(
        <LetterPreviewForm template={baseTemplate} variant='short' />
      );

      expect(container.asFragment()).toMatchSnapshot();
    });
  });
});
