import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockDeep } from 'jest-mock-extended';
import {
  TemplateFormState,
  SMSTemplate,
  CreateUpdateSMSTemplate,
} from 'nhs-notify-web-template-management-utils';
import { SmsTemplateForm } from '@forms/SmsTemplateForm/SmsTemplateForm';
import { ErrorCodes } from '@utils/error-codes';

jest.mock('react', () => {
  const originalModule = jest.requireActual('react');

  return {
    ...originalModule,
    useActionState: (
      _: (
        formState: TemplateFormState,
        formData: FormData
      ) => Promise<TemplateFormState>,
      initialState: TemplateFormState
    ) => [initialState, '/action'],
  };
});

jest.mock('@utils/amplify-utils');

describe('CreateSmsTemplate component', () => {
  const errorLogger = console.error;

  beforeAll(() => {
    global.console.error = jest.fn(); // suppress error logging in tests
  });

  afterAll(() => {
    jest.resetAllMocks();
    global.console.error = errorLogger;
  });

  test('renders page with back link if initial state has no id - edit mode', async () => {
    const container = render(
      <SmsTemplateForm
        initialState={mockDeep<TemplateFormState<CreateUpdateSMSTemplate>>({
          errorState: undefined,
          name: 'template-name',
          message: 'template-message',
        })}
      />
    );
    expect(container.asFragment()).toMatchSnapshot();
  });

  test('renders page with no back link if initial state has id', async () => {
    const container = render(
      <SmsTemplateForm
        initialState={mockDeep<TemplateFormState<SMSTemplate>>({
          errorState: undefined,
          id: 'template-id',
          name: 'template-name',
          message: 'template-message',
        })}
      />
    );
    expect(container.asFragment()).toMatchSnapshot();
  });

  test('renders page one error', () => {
    const container = render(
      <SmsTemplateForm
        initialState={mockDeep<TemplateFormState<SMSTemplate>>({
          errorState: {
            formErrors: [],
            fieldErrors: {
              smsTemplateName: ['Template name error'],
            },
          },
          id: 'template-id',
          name: 'template-name',
          message: 'template-message',
        })}
      />
    );
    expect(container.asFragment()).toMatchSnapshot();
  });

  test('renders page with multiple errors', () => {
    const container = render(
      <SmsTemplateForm
        initialState={mockDeep<TemplateFormState<SMSTemplate>>({
          errorState: {
            formErrors: [],
            fieldErrors: {
              smsTemplateName: ['Template name error'],
              smsTemplateMessage: [
                'Template message error',
                ErrorCodes.MESSAGE_CONTAINS_INVALID_PERSONALISATION_FIELD_NAME,
              ],
            },
          },
          id: 'template-id',
          name: 'template-name',
          message: 'template-message',
        })}
      />
    );
    expect(container.asFragment()).toMatchSnapshot();
  });

  test('it renders expected character count', async () => {
    const user = userEvent.setup();

    render(
      <SmsTemplateForm
        initialState={mockDeep<TemplateFormState<SMSTemplate>>({
          errorState: undefined,
          name: '',
          message: '',
          id: 'template-id',
        })}
      />
    );

    const templateMessageBox = screen.getByLabelText('Message');

    const longMessage = 'x'.repeat(300);

    await user.type(templateMessageBox, longMessage);

    const characterCount = await screen.findByTestId('character-message-count');

    expect(characterCount.textContent).toContain(
      `${longMessage.length} characters`
    );
  }, 15_000);

  test('Client-side validation triggers - valid form - no errors', () => {
    const container = render(
      <SmsTemplateForm
        initialState={mockDeep<TemplateFormState<SMSTemplate>>({
          errorState: undefined,
          name: 'template-name',
          message: 'template-message',
          id: 'template-id',
        })}
      />
    );
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    expect(container.asFragment()).toMatchSnapshot();
  });

  test('Client-side validation triggers - invalid form - errors displayed', () => {
    const container = render(
      <SmsTemplateForm
        initialState={mockDeep<TemplateFormState<SMSTemplate>>({
          errorState: undefined,
          name: '',
          message: '',
          id: 'template-id',
        })}
      />
    );
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    expect(container.asFragment()).toMatchSnapshot();
  });
});
