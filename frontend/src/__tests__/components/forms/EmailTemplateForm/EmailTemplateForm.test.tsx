import { fireEvent, render, screen } from '@testing-library/react';
import { mockDeep } from 'jest-mock-extended';
import {
  TemplateFormState,
  EmailTemplate,
} from 'nhs-notify-web-template-management-utils';
import { EmailTemplateForm } from '@forms/EmailTemplateForm/EmailTemplateForm';
import { ErrorCodes } from '@utils/error-codes';

jest.mock('@utils/amplify-utils');

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

const errorLogger = console.error;

beforeAll(() => {
  global.console.error = jest.fn(); // suppress error logging in tests
});

afterAll(() => {
  jest.resetAllMocks();
  global.console.error = errorLogger;
});

test('renders page with preloaded field values', () => {
  const container = render(
    <EmailTemplateForm
      initialState={mockDeep<TemplateFormState<EmailTemplate>>({
        errorState: undefined,
        name: 'template-name',
        subject: 'template-subject-line',
        message: 'template-message',
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders page without back link for initial state with id - edit mode', () => {
  const container = render(
    <EmailTemplateForm
      initialState={mockDeep<TemplateFormState<EmailTemplate>>({
        errorState: undefined,
        name: 'template-name',
        subject: 'template-subject-line',
        message: 'template-message',
        id: 'template-id',
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders page one error', () => {
  const container = render(
    <EmailTemplateForm
      initialState={mockDeep<TemplateFormState<EmailTemplate>>({
        errorState: {
          formErrors: [],
          fieldErrors: {
            emailTemplateName: ['Template name error'],
          },
        },
        name: '',
        subject: '',
        message: '',
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders page with multiple errors', () => {
  const container = render(
    <EmailTemplateForm
      initialState={mockDeep<TemplateFormState<EmailTemplate>>({
        errorState: {
          formErrors: [],
          fieldErrors: {
            emailTemplateName: ['Template name error'],
            emailTemplateSubjectLine: ['Template subject line error'],
            emailTemplateMessage: [
              'Template message error',
              ErrorCodes.MESSAGE_CONTAINS_INVALID_PERSONALISATION_FIELD_NAME,
            ],
          },
        },
        name: '',
        subject: '',
        message: '',
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('Client-side validation triggers - valid form - no errors', () => {
  const container = render(
    <EmailTemplateForm
      initialState={mockDeep<TemplateFormState<EmailTemplate>>({
        name: 'template-name',
        subject: 'template-subject-line',
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
    <EmailTemplateForm
      initialState={mockDeep<TemplateFormState<EmailTemplate>>({
        name: 'template-name',
        subject: '',
        message: 'template-message',
        id: 'template-id',
      })}
    />
  );
  const submitButton = screen.getByTestId('submit-button');
  fireEvent.click(submitButton);

  expect(container.asFragment()).toMatchSnapshot();
});
