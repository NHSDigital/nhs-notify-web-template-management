import { render } from '@testing-library/react';
import { mockDeep } from 'jest-mock-extended';
import { TemplateFormState } from '@utils/types';
import { CreateEmailTemplate } from '@forms/CreateEmailTemplate/CreateEmailTemplate';

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

test('renders page', async () => {
  const container = render(
    <CreateEmailTemplate
      initialState={mockDeep<TemplateFormState>({
        validationError: undefined,
        emailTemplateName: undefined,
        emailTemplateSubjectLine: undefined,
        emailTemplateMessage: undefined,
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders page with preloaded field values', () => {
  const container = render(
    <CreateEmailTemplate
      initialState={mockDeep<TemplateFormState>({
        validationError: undefined,
        emailTemplateName: 'template-name',
        emailTemplateSubjectLine: 'template-subject-line',
        emailTemplateMessage: 'template-message',
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders page one error', () => {
  const container = render(
    <CreateEmailTemplate
      initialState={mockDeep<TemplateFormState>({
        validationError: {
          formErrors: [],
          fieldErrors: {
            emailTemplateName: ['Template name error'],
          },
        },
        emailTemplateName: '',
        emailTemplateSubjectLine: '',
        emailTemplateMessage: '',
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders page with multiple errors', () => {
  const container = render(
    <CreateEmailTemplate
      initialState={mockDeep<TemplateFormState>({
        validationError: {
          formErrors: [],
          fieldErrors: {
            emailTemplateName: ['Template name error'],
            emailTemplateSubjectLine: ['Template subject line error'],
            emailTemplateMessage: ['Template message error'],
          },
        },
        emailTemplateName: '',
        emailTemplateSubjectLine: '',
        emailTemplateMessage: '',
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});
