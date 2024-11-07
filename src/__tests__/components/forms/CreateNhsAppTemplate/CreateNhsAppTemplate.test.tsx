import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockDeep } from 'jest-mock-extended';
import { TemplateFormState } from '@utils/types';
import { CreateNhsAppTemplate } from '@forms/CreateNhsAppTemplate/CreateNhsAppTemplate';

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
    <CreateNhsAppTemplate
      initialState={mockDeep<TemplateFormState>({
        validationError: undefined,
        NHS_APP: undefined,
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
    <CreateNhsAppTemplate
      initialState={mockDeep<TemplateFormState>({
        validationError: undefined,
        NHS_APP: {
          name: 'template-name',
          message: 'template-message',
        },
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders page one error', () => {
  const container = render(
    <CreateNhsAppTemplate
      initialState={mockDeep<TemplateFormState>({
        validationError: {
          formErrors: [],
          fieldErrors: {
            nhsAppTemplateName: ['Template name error'],
          },
        },
        NHS_APP: {
          name: '',
          message: '',
        },
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders page with multiple errors', () => {
  const container = render(
    <CreateNhsAppTemplate
      initialState={mockDeep<TemplateFormState>({
        validationError: {
          formErrors: [],
          fieldErrors: {
            nhsAppTemplateName: ['Template name error'],
            nhsAppTemplateMessage: ['Template message error'],
          },
        },
        NHS_APP: {
          name: '',
          message: '',
        },
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});
