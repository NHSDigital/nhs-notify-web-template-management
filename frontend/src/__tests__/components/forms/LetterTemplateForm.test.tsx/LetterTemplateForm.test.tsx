import { fireEvent, render, screen } from '@testing-library/react';
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
        errorState: undefined,
        name: 'template-name',
        letterType: 'x1',
        language: 'ar',
      })}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('shows right-to-left language warning when language changes', () => {
  const initialLanguage = 'en';
  const selectedLanguage = 'fa';

  const container = render(
    <LetterTemplateForm
      initialState={mockDeep<TemplateFormState<LetterTemplate>>({
        errorState: undefined,
        name: 'template-name',
        letterType: 'x1',
        language: initialLanguage,
      })}
    />
  );

  fireEvent.change(container.getByTestId('language-select'), {
    target: { value: selectedLanguage },
  });

  const warningElements = container.queryAllByTestId('rtl-language-warning');

  expect(warningElements.length).toBe(1);
  expect(container.asFragment()).toMatchSnapshot();
});

test('hides right-to-left language warning when language changes', () => {
  const initialLanguage = 'fa';
  const selectedLanguage = 'en';

  const container = render(
    <LetterTemplateForm
      initialState={mockDeep<TemplateFormState<LetterTemplate>>({
        errorState: undefined,
        name: 'template-name',
        letterType: 'x1',
        language: initialLanguage,
      })}
    />
  );

  fireEvent.change(container.getByTestId('language-select'), {
    target: { value: selectedLanguage },
  });

  const warningElements = container.queryAllByTestId('rtl-language-warning');

  expect(warningElements.length).toBe(0);
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders page one error', () => {
  const container = render(
    <LetterTemplateForm
      initialState={mockDeep<TemplateFormState<LetterTemplate>>({
        errorState: {
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
        errorState: {
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

test('Client-side validation triggers', () => {
  const container = render(
    <LetterTemplateForm
      initialState={mockDeep<TemplateFormState<LetterTemplate>>({
        errorState: undefined,
        name: undefined,
        letterType: undefined,
        language: undefined,
      })}
    />
  );
  const submitButton = screen.getByTestId('submit-button');
  fireEvent.click(submitButton);
  expect(container.asFragment()).toMatchSnapshot();
});
