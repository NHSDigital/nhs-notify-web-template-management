import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockDeep } from 'jest-mock-extended';
import {
  NHSAppTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';
import { NhsAppTemplateForm } from '@forms/NhsAppTemplateForm/NhsAppTemplateForm';
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

test('renders page', async () => {
  const user = userEvent.setup();

  const container = render(
    <NhsAppTemplateForm
      initialState={mockDeep<TemplateFormState<NHSAppTemplate>>({
        errorState: undefined,
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
        errorState: undefined,
        name: 'template-name',
        message: 'template-message',
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders page without back link for initial state with id - edit mode', () => {
  const container = render(
    <NhsAppTemplateForm
      initialState={mockDeep<TemplateFormState<NHSAppTemplate>>({
        errorState: undefined,
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
        errorState: {
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
        errorState: {
          formErrors: [],
          fieldErrors: {
            nhsAppTemplateName: ['Template name error'],
            nhsAppTemplateMessage: [
              'Template message error',
              ErrorCodes.MESSAGE_CONTAINS_INVALID_PERSONALISATION_FIELD_NAME,
            ],
          },
        },
        name: '',
        message: '',
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('Client-side validation triggers', () => {
  const container = render(
    <NhsAppTemplateForm
      initialState={mockDeep<TemplateFormState<NHSAppTemplate>>({
        errorState: undefined,
        name: 'template-name',
        message: 'template-message',
      })}
    />
  );
  const submitButton = screen.getByTestId('submit-button');
  fireEvent.click(submitButton);
  expect(container.asFragment()).toMatchSnapshot();
});
