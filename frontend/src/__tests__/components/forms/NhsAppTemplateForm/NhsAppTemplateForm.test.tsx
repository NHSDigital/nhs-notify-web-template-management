import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockDeep } from 'jest-mock-extended';
import {
  NHSAppTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';
import { NhsAppTemplateForm } from '@forms/NhsAppTemplateForm/NhsAppTemplateForm';

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
    <NhsAppTemplateForm
      initialState={mockDeep<TemplateFormState<NHSAppTemplate>>({
        validationError: undefined,
        name: 'template-name',
        message: 'template-message',
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();

  const templateNameBox = document.querySelector('#nhsAppTemplateName');
  if (!templateNameBox) {
    throw new Error('Template name box not found');
  }
  await user.type(templateNameBox, 'template-name');

  const templateMessageBox = document.querySelector('#nhsAppTemplateMessage');
  if (!templateMessageBox) {
    throw new Error('Template name box not found');
  }
  await user.type(templateMessageBox, 'template-message');
});

test('renders page with preloaded field values', () => {
  const container = render(
    <NhsAppTemplateForm
      initialState={mockDeep<TemplateFormState<NHSAppTemplate>>({
        validationError: undefined,
        name: 'template-name',
        message: 'template-message',
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders page without back link for initial state with id', () => {
  const container = render(
    <NhsAppTemplateForm
      initialState={mockDeep<TemplateFormState<NHSAppTemplate>>({
        validationError: undefined,
        name: 'template-name',
        message: 'template-message',
        id: 'template-id',
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders page one error', () => {
  const container = render(
    <NhsAppTemplateForm
      initialState={mockDeep<TemplateFormState<NHSAppTemplate>>({
        validationError: {
          formErrors: [],
          fieldErrors: {
            nhsAppTemplateName: ['Template name error'],
          },
        },
        name: '',
        message: '',
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders page with multiple errors', () => {
  const container = render(
    <NhsAppTemplateForm
      initialState={mockDeep<TemplateFormState<NHSAppTemplate>>({
        validationError: {
          formErrors: [],
          fieldErrors: {
            nhsAppTemplateName: ['Template name error'],
            nhsAppTemplateMessage: ['Template message error'],
          },
        },
        name: '',
        message: '',
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});
