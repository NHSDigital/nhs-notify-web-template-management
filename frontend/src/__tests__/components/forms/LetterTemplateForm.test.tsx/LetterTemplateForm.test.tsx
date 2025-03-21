import { render } from '@testing-library/react';
import { mockDeep } from 'jest-mock-extended';
import {
  TemplateFormState,
  LetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { LetterTemplateForm } from '@forms/LetterTemplateForm/LetterTemplateForm';

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

test('renders page with preloaded field values', () => {
  const container = render(
    <LetterTemplateForm
      initialState={mockDeep<TemplateFormState<LetterTemplate>>({
        validationError: undefined,
        name: 'template-name',
        letterType: 'q1',
        language: 'ar',
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders page one error', () => {
  const container = render(
    <LetterTemplateForm
      initialState={mockDeep<TemplateFormState<LetterTemplate>>({
        validationError: {
          formErrors: [],
          fieldErrors: {
            letterTemplateName: ['Template name error'],
          },
        },
        name: '',
        letterType: 'x0',
        language: 'en',
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders page with multiple errors', () => {
  const container = render(
    <LetterTemplateForm
      initialState={mockDeep<TemplateFormState<LetterTemplate>>({
        validationError: {
          formErrors: [],
          fieldErrors: {
            letterTemplateName: ['Template name error'],
            letterType: ['Template letter type error'],
            letterLanguage: ['Template language error'],
            letterTemplatePdf: ['PDF error'],
            letterTemplateCsv: ['CSV error'],
          },
        },
        name: '',
        letterType: undefined,
        language: undefined,
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});
