import { render, screen, fireEvent } from '@testing-library/react';
import { LetterRenderForm } from '@molecules/LetterRender/LetterRenderForm';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';
import type { LetterRenderFormData } from '@molecules/LetterRender/types';

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
  systemPersonalisation: ['firstName', 'lastName'],
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
};

const defaultFormData: LetterRenderFormData = {
  systemPersonalisationPackId: '',
  personalisationParameters: {},
};

const defaultProps = {
  template: baseTemplate,
  variant: 'short' as const,
  formData: defaultFormData,
  errors: {},
  isLoading: false,
  onFormChange: jest.fn(),
  onSubmit: jest.fn(),
};

describe('LetterRenderForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PDS personalisation section', () => {
    it('renders the PDS section heading and hint', () => {
      render(<LetterRenderForm {...defaultProps} />);

      expect(
        screen.getByText('PDS personalisation fields')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'The PDS fields will be pre-filled with example data when you choose a test recipient.'
        )
      ).toBeInTheDocument();
    });

    it('renders PDS recipient dropdown with short recipients for short variant', () => {
      render(<LetterRenderForm {...defaultProps} variant='short' />);

      const dropdown = screen.getByRole('combobox', {
        name: /example recipient/i,
      });
      expect(dropdown).toBeInTheDocument();

      // Check for short recipient options
      expect(screen.getByText('Jo Blogs')).toBeInTheDocument();
      expect(screen.getByText('Dr Li Wei')).toBeInTheDocument();
      expect(screen.getByText('Mx Ana Kim')).toBeInTheDocument();
    });

    it('renders PDS recipient dropdown with long recipients for long variant', () => {
      render(<LetterRenderForm {...defaultProps} variant='long' />);

      const dropdown = screen.getByRole('combobox', {
        name: /example recipient/i,
      });
      expect(dropdown).toBeInTheDocument();

      // Check for long recipient options
      expect(
        screen.getByText('Joseph Anthony Hendrington-Bloggs')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Dr Alejandro Ruiz Fernandez')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Prof Catherine Montgomery-Harrington')
      ).toBeInTheDocument();
    });

    it('displays error message when PDS field has error', () => {
      render(
        <LetterRenderForm
          {...defaultProps}
          errors={{
            systemPersonalisationPackId: ['Please select a recipient'],
          }}
        />
      );

      expect(screen.getByText('Please select a recipient')).toBeInTheDocument();
    });

    it('calls onFormChange when PDS dropdown changes', () => {
      const onFormChange = jest.fn();
      render(
        <LetterRenderForm {...defaultProps} onFormChange={onFormChange} />
      );

      const dropdown = screen.getByRole('combobox', {
        name: /example recipient/i,
      });
      fireEvent.change(dropdown, { target: { value: 'short-1' } });

      expect(onFormChange).toHaveBeenCalledWith({
        systemPersonalisationPackId: 'short-1',
        personalisationParameters: {},
      });
    });
  });

  describe('Custom personalisation section', () => {
    it('renders custom personalisation fields when template has customPersonalisation', () => {
      const templateWithCustom: AuthoringLetterTemplate = {
        ...baseTemplate,
        customPersonalisation: ['appointmentDate', 'clinicName'],
      };

      render(
        <LetterRenderForm {...defaultProps} template={templateWithCustom} />
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

      render(
        <LetterRenderForm {...defaultProps} template={templateWithoutCustom} />
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

      render(
        <LetterRenderForm
          {...defaultProps}
          template={templateWithEmptyCustom}
        />
      );

      expect(
        screen.queryByText('Custom personalisation fields')
      ).not.toBeInTheDocument();
    });

    it('displays error for custom field', () => {
      const templateWithCustom: AuthoringLetterTemplate = {
        ...baseTemplate,
        customPersonalisation: ['appointmentDate'],
      };

      render(
        <LetterRenderForm
          {...defaultProps}
          template={templateWithCustom}
          errors={{ custom_appointmentDate: ['Field is required'] }}
        />
      );

      expect(screen.getByText('Field is required')).toBeInTheDocument();
    });

    it('calls onFormChange when custom field changes', () => {
      const onFormChange = jest.fn();
      const templateWithCustom: AuthoringLetterTemplate = {
        ...baseTemplate,
        customPersonalisation: ['appointmentDate'],
      };

      render(
        <LetterRenderForm
          {...defaultProps}
          template={templateWithCustom}
          onFormChange={onFormChange}
        />
      );

      const input = screen.getByLabelText('appointmentDate');
      fireEvent.change(input, { target: { value: '2025-01-15' } });

      expect(onFormChange).toHaveBeenCalledWith({
        systemPersonalisationPackId: '',
        personalisationParameters: { appointmentDate: '2025-01-15' },
      });
    });
  });

  describe('controlled form values', () => {
    it('displays selected PDS recipient from formData', () => {
      render(
        <LetterRenderForm
          {...defaultProps}
          formData={{
            systemPersonalisationPackId: 'short-1',
            personalisationParameters: {},
          }}
        />
      );

      const dropdown = screen.getByRole('combobox', {
        name: /example recipient/i,
      });
      expect(dropdown).toHaveValue('short-1');
    });

    it('displays custom field values from formData', () => {
      const templateWithCustom: AuthoringLetterTemplate = {
        ...baseTemplate,
        customPersonalisation: ['appointmentDate'],
      };

      render(
        <LetterRenderForm
          {...defaultProps}
          template={templateWithCustom}
          formData={{
            systemPersonalisationPackId: '',
            personalisationParameters: { appointmentDate: '2025-01-15' },
          }}
        />
      );

      const input = screen.getByLabelText('appointmentDate');
      expect(input).toHaveValue('2025-01-15');
    });
  });

  describe('submit button', () => {
    it('renders the update preview button', () => {
      render(<LetterRenderForm {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: 'Update preview' })
      ).toBeInTheDocument();
    });

    it('calls onSubmit when form is submitted', () => {
      const onSubmit = jest.fn();
      render(<LetterRenderForm {...defaultProps} onSubmit={onSubmit} />);

      const button = screen.getByRole('button', { name: 'Update preview' });
      fireEvent.click(button);

      expect(onSubmit).toHaveBeenCalled();
    });

    it('disables form elements when isLoading is true', () => {
      render(<LetterRenderForm {...defaultProps} isLoading={true} />);

      const dropdown = screen.getByRole('combobox', {
        name: /example recipient/i,
      });
      const button = screen.getByRole('button', { name: 'Update preview' });

      expect(dropdown).toBeDisabled();
      expect(button).toBeDisabled();
    });
  });

  describe('snapshots', () => {
    it('matches snapshot for short variant', () => {
      const templateWithCustom: AuthoringLetterTemplate = {
        ...baseTemplate,
        customPersonalisation: ['appointmentDate', 'clinicName'],
      };

      const container = render(
        <LetterRenderForm {...defaultProps} template={templateWithCustom} />
      );

      expect(container.asFragment()).toMatchSnapshot();
    });

    it('matches snapshot for long variant', () => {
      const templateWithCustom: AuthoringLetterTemplate = {
        ...baseTemplate,
        customPersonalisation: ['appointmentDate'],
      };

      const container = render(
        <LetterRenderForm
          {...defaultProps}
          template={templateWithCustom}
          variant='long'
        />
      );

      expect(container.asFragment()).toMatchSnapshot();
    });

    it('matches snapshot without custom personalisation', () => {
      const container = render(<LetterRenderForm {...defaultProps} />);

      expect(container.asFragment()).toMatchSnapshot();
    });
  });
});
