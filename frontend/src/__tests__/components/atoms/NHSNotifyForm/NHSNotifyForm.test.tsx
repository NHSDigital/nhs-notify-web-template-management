import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  ErrorState,
  FormState,
} from 'nhs-notify-web-template-management-utils';
import { Label } from '@atoms/nhsuk-components';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { verifyFormCsrfToken } from '@utils/csrf-utils';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import * as NHSNotifyForm from '@atoms/NHSNotifyForm';

jest.mock('@utils/csrf-utils');

jest.mocked(verifyFormCsrfToken).mockResolvedValue(true);

function UserRegistrationForm() {
  return (
    <>
      <NHSNotifyForm.ErrorSummary />
      <NHSNotifyForm.Form formId='user-registration'>
        <NHSNotifyForm.FormGroup htmlFor='firstName'>
          <Label htmlFor='firstName'>First name</Label>
          <NHSNotifyForm.ErrorMessage htmlFor='firstName' />
          <NHSNotifyForm.Input id='firstName' name='firstName' type='text' />
        </NHSNotifyForm.FormGroup>

        <NHSNotifyForm.FormGroup htmlFor='lastName'>
          <Label htmlFor='lastName'>Last name</Label>
          <NHSNotifyForm.ErrorMessage htmlFor='lastName' />
          <NHSNotifyForm.Input id='lastName' name='lastName' type='text' />
        </NHSNotifyForm.FormGroup>

        <NHSNotifyForm.FormGroup htmlFor='email'>
          <Label htmlFor='email'>Email address</Label>
          <NHSNotifyForm.ErrorMessage htmlFor='email' />
          <NHSNotifyForm.Input id='email' name='email' type='email' />
        </NHSNotifyForm.FormGroup>

        <NHSNotifyForm.FormGroup htmlFor='role'>
          <Label htmlFor='role'>Role</Label>
          <NHSNotifyForm.ErrorMessage htmlFor='role' />
          <NHSNotifyForm.Select id='role' name='role'>
            <option value=''>Please select</option>
            <option value='admin'>Administrator</option>
            <option value='editor'>Editor</option>
            <option value='viewer'>Viewer</option>
          </NHSNotifyForm.Select>
        </NHSNotifyForm.FormGroup>

        <NHSNotifyForm.FormGroup htmlFor='colour'>
          <fieldset className='nhsuk-fieldset'>
            <legend className='nhsuk-fieldset__legend'>
              <h1 className='nhsuk-fieldset__heading'>
                What is your favourite colour?
              </h1>
            </legend>
            <NHSNotifyForm.ErrorMessage htmlFor='colour' />
            <div className='nhsuk-radios'>
              <div className='nhsuk-radios__item'>
                <NHSNotifyForm.RadioInput name='colour' id='red' value='red' />
                <Label className='nhsuk-radios__label' htmlFor='red'>
                  Red
                </Label>
              </div>
              <div className='nhsuk-radios__item'>
                <NHSNotifyForm.RadioInput
                  name='colour'
                  id='green'
                  value='green'
                />
                <Label className='nhsuk-radios__label' htmlFor='green'>
                  Green
                </Label>
              </div>
              <div className='nhsuk-radios__item'>
                <NHSNotifyForm.RadioInput
                  name='colour'
                  id='blue'
                  value='blue'
                />
                <Label className='nhsuk-radios__label' htmlFor='blue'>
                  Blue
                </Label>
              </div>
            </div>
          </fieldset>
        </NHSNotifyForm.FormGroup>

        <NHSNotifyButton type='submit'>Create user</NHSNotifyButton>
      </NHSNotifyForm.Form>
    </>
  );
}

describe('NHSNotifyForm components', () => {
  describe('User Registration Form', () => {
    it('renders the complete form with all fields', () => {
      const mockServerAction = jest.fn().mockResolvedValue({});

      const result = render(
        <NHSNotifyFormProvider serverAction={mockServerAction}>
          <UserRegistrationForm />
        </NHSNotifyFormProvider>
      );

      expect(screen.getByLabelText('First name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email address')).toBeInTheDocument();
      expect(screen.getByLabelText('Role')).toBeInTheDocument();
      expect(screen.getByLabelText('Red')).toBeInTheDocument();
      expect(screen.getByLabelText('Green')).toBeInTheDocument();
      expect(screen.getByLabelText('Blue')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Create user' })
      ).toBeInTheDocument();

      expect(result.asFragment()).toMatchSnapshot();
    });

    it('submits form data correctly when user fills out all fields', async () => {
      const user = userEvent.setup();
      const mockServerAction = jest.fn().mockResolvedValue({});

      render(
        <NHSNotifyFormProvider serverAction={mockServerAction}>
          <UserRegistrationForm />
        </NHSNotifyFormProvider>
      );

      // Fill out the form
      await user.type(screen.getByLabelText('First name'), 'John');
      await user.type(screen.getByLabelText('Last name'), 'Smith');
      await user.type(
        screen.getByLabelText('Email address'),
        'john.smith@nhs.uk'
      );
      await user.selectOptions(screen.getByLabelText('Role'), 'admin');
      await user.click(screen.getByLabelText('Green'));

      // Submit the form
      await user.click(screen.getByRole('button', { name: 'Create user' }));

      await waitFor(() => {
        expect(mockServerAction).toHaveBeenCalledTimes(1);
      });

      const formData = mockServerAction.mock.calls[0][1] as FormData;
      expect(formData.get('firstName')).toBe('John');
      expect(formData.get('lastName')).toBe('Smith');
      expect(formData.get('email')).toBe('john.smith@nhs.uk');
      expect(formData.get('role')).toBe('admin');
      expect(formData.get('colour')).toBe('green');
    });

    it('allows only one radio option to be selected at a time', async () => {
      const user = userEvent.setup();
      const mockServerAction = jest.fn().mockResolvedValue({});

      render(
        <NHSNotifyFormProvider serverAction={mockServerAction}>
          <UserRegistrationForm />
        </NHSNotifyFormProvider>
      );

      const redRadio = screen.getByLabelText('Red');
      const greenRadio = screen.getByLabelText('Green');
      const blueRadio = screen.getByLabelText('Blue');

      expect(redRadio).not.toBeChecked();
      expect(greenRadio).not.toBeChecked();
      expect(blueRadio).not.toBeChecked();

      await user.click(redRadio);

      expect(redRadio).toBeChecked();
      expect(greenRadio).not.toBeChecked();
      expect(blueRadio).not.toBeChecked();

      await user.click(blueRadio);

      expect(redRadio).not.toBeChecked();
      expect(greenRadio).not.toBeChecked();
      expect(blueRadio).toBeChecked();
    });

    it('displays validation errors when form submission fails', async () => {
      const user = userEvent.setup();
      const errorState: ErrorState = {
        fieldErrors: {
          firstName: ['First name is required'],
          email: ['Enter a valid email address'],
          role: ['Please select a role'],
          colour: ['Please select a colour'],
        },
      };

      const mockServerAction = jest
        .fn()
        .mockResolvedValue({ errorState } as FormState);

      render(
        <NHSNotifyFormProvider serverAction={mockServerAction}>
          <UserRegistrationForm />
        </NHSNotifyFormProvider>
      );

      // Submit form with empty/invalid data
      await user.click(screen.getByRole('button', { name: 'Create user' }));

      await waitFor(() => {
        expect(
          screen.getAllByText('First name is required').length
        ).toBeGreaterThan(0);
        expect(
          screen.getAllByText('Enter a valid email address').length
        ).toBeGreaterThan(0);
        expect(
          screen.getAllByText('Please select a role').length
        ).toBeGreaterThan(0);
        expect(
          screen.getAllByText('Please select a colour').length
        ).toBeGreaterThan(0);
      });

      // Check that form groups have error styling
      const firstNameGroup = screen
        .getByLabelText('First name')
        .closest('.nhsuk-form-group');
      expect(firstNameGroup).toHaveClass('nhsuk-form-group--error');

      const roleSelect = screen.getByLabelText('Role');
      expect(roleSelect).toHaveClass('nhsuk-select--error');
    });

    it('populates form fields with initial values from state', () => {
      const mockServerAction = jest.fn().mockResolvedValue({});
      const initialState: FormState = {
        fields: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@nhs.uk',
          role: 'editor',
          colour: 'blue',
        },
      };

      render(
        <NHSNotifyFormProvider
          serverAction={mockServerAction}
          initialState={initialState}
        >
          <UserRegistrationForm />
        </NHSNotifyFormProvider>
      );

      expect(screen.getByLabelText('First name')).toHaveValue('Jane');
      expect(screen.getByLabelText('Last name')).toHaveValue('Doe');
      expect(screen.getByLabelText('Email address')).toHaveValue(
        'jane.doe@nhs.uk'
      );
      expect(screen.getByLabelText('Role')).toHaveValue('editor');
      expect(screen.getByLabelText('Blue')).toBeChecked();
    });

    it('renders with initial error state and field values', () => {
      const mockServerAction = jest.fn().mockResolvedValue({});
      const errorState: ErrorState = {
        fieldErrors: {
          email: ['Enter a valid email address'],
          role: ['Please select a role'],
        },
      };

      const initialState: FormState = {
        fields: {
          firstName: 'John',
          lastName: 'Smith',
          email: 'invalid-email',
          role: '',
          colour: 'red',
        },
        errorState,
      };

      render(
        <NHSNotifyFormProvider
          serverAction={mockServerAction}
          initialState={initialState}
        >
          <UserRegistrationForm />
        </NHSNotifyFormProvider>
      );

      // Fields should be populated with submitted values
      expect(screen.getByLabelText('First name')).toHaveValue('John');
      expect(screen.getByLabelText('Last name')).toHaveValue('Smith');
      expect(screen.getByLabelText('Email address')).toHaveValue(
        'invalid-email'
      );
      expect(screen.getByLabelText('Role')).toHaveValue('');
      expect(screen.getByLabelText('Red')).toBeChecked();

      // Errors should be displayed
      expect(
        screen.getAllByText('Enter a valid email address').length
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByText('Please select a role').length
      ).toBeGreaterThan(0);

      // Form groups with errors should have error styling
      const emailGroup = screen
        .getByLabelText('Email address')
        .closest('.nhsuk-form-group');
      expect(emailGroup).toHaveClass('nhsuk-form-group--error');

      const roleGroup = screen
        .getByLabelText('Role')
        .closest('.nhsuk-form-group');
      expect(roleGroup).toHaveClass('nhsuk-form-group--error');
    });

    it('populates fields from server action response after submission', async () => {
      const user = userEvent.setup();
      const errorState: ErrorState = {
        fieldErrors: {
          email: ['This email is already registered'],
        },
      };

      // Server action returns error and preserves the submitted field values
      const mockServerAction = jest.fn().mockResolvedValue({
        errorState,
        fields: {
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice@example.com',
          role: 'viewer',
          colour: 'green',
        },
      } as FormState);

      render(
        <NHSNotifyFormProvider serverAction={mockServerAction}>
          <UserRegistrationForm />
        </NHSNotifyFormProvider>
      );

      // Fill out the form
      await user.type(screen.getByLabelText('First name'), 'Alice');
      await user.type(screen.getByLabelText('Last name'), 'Johnson');
      await user.type(
        screen.getByLabelText('Email address'),
        'alice@example.com'
      );
      await user.selectOptions(screen.getByLabelText('Role'), 'viewer');
      await user.click(screen.getByLabelText('Green'));

      // Submit the form
      await user.click(screen.getByRole('button', { name: 'Create user' }));

      await waitFor(() => {
        // Fields should be populated with values from server response
        expect(screen.getByLabelText('First name')).toHaveValue('Alice');
        expect(screen.getByLabelText('Last name')).toHaveValue('Johnson');
        expect(screen.getByLabelText('Email address')).toHaveValue(
          'alice@example.com'
        );
        expect(screen.getByLabelText('Role')).toHaveValue('viewer');
        expect(screen.getByLabelText('Green')).toBeChecked();

        // Error should be displayed
        expect(
          screen.getAllByText('This email is already registered').length
        ).toBeGreaterThan(0);
      });
    });

    it('clears fields when server action returns success without fields', async () => {
      const user = userEvent.setup();

      // First render with initial values
      const initialState: FormState = {
        fields: {
          firstName: 'Bob',
          lastName: 'Brown',
          email: 'bob@nhs.uk',
          role: 'admin',
          colour: 'red',
        },
      };

      // Server action returns empty response (success case)
      const mockServerAction = jest.fn().mockResolvedValue({});

      render(
        <NHSNotifyFormProvider
          serverAction={mockServerAction}
          initialState={initialState}
        >
          <UserRegistrationForm />
        </NHSNotifyFormProvider>
      );

      // Initially populated
      expect(screen.getByLabelText('First name')).toHaveValue('Bob');
      expect(screen.getByLabelText('Last name')).toHaveValue('Brown');
      expect(screen.getByLabelText('Email address')).toHaveValue('bob@nhs.uk');
      expect(screen.getByLabelText('Role')).toHaveValue('admin');
      expect(screen.getByLabelText('Red')).toBeChecked();

      // Submit the form
      await user.click(screen.getByRole('button', { name: 'Create user' }));

      await waitFor(() => {
        expect(mockServerAction).toHaveBeenCalledTimes(1);
      });

      // Fields should be cleared (no fields in response means success/redirect scenario)
      await waitFor(() => {
        expect(screen.getByLabelText('First name')).toHaveValue('');
        expect(screen.getByLabelText('Last name')).toHaveValue('');
        expect(screen.getByLabelText('Email address')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
        expect(screen.getByLabelText('Red')).not.toBeChecked();
        expect(screen.getByLabelText('Green')).not.toBeChecked();
        expect(screen.getByLabelText('Blue')).not.toBeChecked();
      });
    });
  });
});
