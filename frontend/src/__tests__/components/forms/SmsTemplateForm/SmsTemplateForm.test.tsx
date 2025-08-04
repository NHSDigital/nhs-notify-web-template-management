import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockDeep } from 'jest-mock-extended';
import {
  TemplateFormState,
  SMSTemplate,
  CreateUpdateSMSTemplate,
} from 'nhs-notify-web-template-management-utils';
import { SmsTemplateForm } from '@forms/SmsTemplateForm/SmsTemplateForm';

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
  test('renders page with back link if initial state has no id - edit mode', async () => {
    const container = render(
      <SmsTemplateForm
        initialState={mockDeep<TemplateFormState<CreateUpdateSMSTemplate>>({
          validationError: undefined,
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
          validationError: undefined,
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
          validationError: {
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
          validationError: {
            formErrors: [],
            fieldErrors: {
              smsTemplateName: ['Template name error'],
              smsTemplateMessage: ['Template message error'],
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
          validationError: undefined,
          name: '',
          message: '',
          id: 'template-id',
        })}
      />
    );

    const templateMessageBox = document.querySelector('#smsTemplateMessage');

    if (!templateMessageBox) {
      throw new Error('Template message box not found');
    }

    const longMessage = 'x'.repeat(300);

    await user.type(templateMessageBox, longMessage);

    const characterCount = screen.getByTestId('character-message-count');

    if (!characterCount) {
      throw new Error('Character count not found');
    }

    expect(characterCount.textContent).toContain(
      `${longMessage.length} characters`
    );
  }, 10_000);

  test('Client-side validation triggers', () => {
    const container = render(
      <SmsTemplateForm
        initialState={mockDeep<TemplateFormState<SMSTemplate>>({
          validationError: undefined,
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
