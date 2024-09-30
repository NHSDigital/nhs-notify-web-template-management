import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockDeep } from 'jest-mock-extended';
import { TemplateFormState } from '@utils/types';
import { CreateEmailTemplate } from '@forms/CreateEmailTemplate/CreateEmailTemplate';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

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
  const user = userEvent.setup();

  const container = render(
    <CreateEmailTemplate
      initialState={mockDeep<TemplateFormState>({
        validationError: undefined,
        emailTemplateName: '',
        emailTemplateMessage: '',
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();

  const templateNameBox = document.querySelector('#emailTemplateName');
  if (!templateNameBox) {
    throw new Error('Template name box not found');
  }
  await user.type(templateNameBox, 'template-name');

  const templateMessageBox = document.querySelector('#emailTemplateMessage');
  if (!templateMessageBox) {
    throw new Error('Template name box not found');
  }
  await user.type(templateMessageBox, 'template-message');
});

test('renders page with preloaded field values', () => {
  const container = render(
    <CreateEmailTemplate
      initialState={mockDeep<TemplateFormState>({
        validationError: undefined,
        emailTemplateName: 'template-name',
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
            emailTemplateMessage: ['Template message error'],
          },
        },
        emailTemplateName: '',
        emailTemplateMessage: '',
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});
