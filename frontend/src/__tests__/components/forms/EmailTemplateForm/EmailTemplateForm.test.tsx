import { render } from '@testing-library/react';
import { mockDeep } from 'jest-mock-extended';
import {
  TemplateFormState,
  EmailTemplate,
} from 'nhs-notify-web-template-management-utils';
import { EmailTemplateForm } from '@forms/EmailTemplateForm/EmailTemplateForm';

jest.mock('@utils/amplify-utils', () => ({
  getAmplifyBackendClient: () => {},
}));

jest.mock('react-dom', () => {
  const originalModule = jest.requireActual('react-dom');

  return {
    ...originalModule,
    useFormState: (
      _: (
        formState: TemplateFormState,
        formData: FormData
      ) => Promise<TemplateFormState>,
      initialState: TemplateFormState
    ) => [initialState, '/action'],
  };
});

test('renders page with preloaded field values', () => {
  const container = render(
    <EmailTemplateForm
      initialState={mockDeep<TemplateFormState<EmailTemplate>>({
        validationError: undefined,
        name: 'template-name',
        subject: 'template-subject-line',
        message: 'template-message',
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders page one error', () => {
  const container = render(
    <EmailTemplateForm
      initialState={mockDeep<TemplateFormState<EmailTemplate>>({
        validationError: {
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
        validationError: {
          formErrors: [],
          fieldErrors: {
            emailTemplateName: ['Template name error'],
            emailTemplateSubjectLine: ['Template subject line error'],
            emailTemplateMessage: ['Template message error'],
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
