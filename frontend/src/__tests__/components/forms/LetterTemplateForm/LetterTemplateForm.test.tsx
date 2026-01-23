import { fireEvent, render, screen } from '@testing-library/react';
import { mockDeep } from 'jest-mock-extended';
import {
  ErrorState,
  TemplateFormState,
  UploadLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { LetterTemplateForm } from '@forms/LetterTemplateForm/LetterTemplateForm';
import userEvent from '@testing-library/user-event';
import { validate } from '@utils/client-validate-form';

jest.mock('@utils/amplify-utils');

jest.mock('@utils/client-validate-form', () => ({
  validate: jest.fn(
    (_: unknown, cb: (value: ErrorState | undefined) => void) =>
      (__: React.FormEvent<HTMLFormElement>) => {
        cb({});
      }
  ),
}));

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
    <LetterTemplateForm
      initialState={mockDeep<TemplateFormState<UploadLetterTemplate>>({
        campaignId: 'campaign-id',
        errorState: undefined,
        name: 'template-name',
        letterType: 'x1',
        language: 'ar',
      })}
      campaignIds={['campaign-id']}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders page with multiple campaign ids', () => {
  const container = render(
    <LetterTemplateForm
      initialState={mockDeep<TemplateFormState<UploadLetterTemplate>>({
        campaignId: 'campaign-id',
        errorState: undefined,
        name: 'template-name',
        letterType: 'x1',
        language: 'ar',
      })}
      campaignIds={['campaign-id', 'other-campaign-id']}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('shows right-to-left language warning when language changes', () => {
  const initialLanguage = 'en';
  const selectedLanguage = 'fa';

  const container = render(
    <LetterTemplateForm
      initialState={mockDeep<TemplateFormState<UploadLetterTemplate>>({
        campaignId: 'campaign-id',
        errorState: undefined,
        name: 'template-name',
        letterType: 'x1',
        language: initialLanguage,
      })}
      campaignIds={['campaign-id']}
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
      initialState={mockDeep<TemplateFormState<UploadLetterTemplate>>({
        campaignId: 'campaign-id',
        errorState: undefined,
        name: 'template-name',
        letterType: 'x1',
        language: initialLanguage,
      })}
      campaignIds={['campaign-id']}
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
      initialState={mockDeep<TemplateFormState<UploadLetterTemplate>>({
        campaignId: 'campaign-id',
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
      campaignIds={['campaign-id']}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders page with multiple errors', () => {
  const container = render(
    <LetterTemplateForm
      initialState={mockDeep<TemplateFormState<UploadLetterTemplate>>({
        campaignId: 'campaign-id',
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
      campaignIds={['campaign-id']}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('Client-side validation triggers - valid form - with errors', async () => {
  const validateMock = jest
    .mocked(validate)
    .mockImplementationOnce(
      (_: unknown, cb: (value: ErrorState | undefined) => void) =>
        (__: React.FormEvent<HTMLFormElement>) => {
          cb({
            fieldErrors: {
              letterTemplateName: ['Mock template name error'],
            },
          });
        }
    );

  const container = render(
    <LetterTemplateForm
      initialState={mockDeep<TemplateFormState<UploadLetterTemplate>>({
        campaignId: 'campaign-id',
        errorState: undefined,
        name: undefined,
        letterType: undefined,
        language: undefined,
      })}
      campaignIds={['campaign-id']}
    />
  );
  const submitButton = screen.getByTestId('submit-button');

  await userEvent.click(submitButton);

  expect(container.asFragment()).toMatchSnapshot();
  expect(validateMock).toHaveBeenCalled();
});

test('Client-side validation triggers - valid form - without errors', async () => {
  const validateMock = jest.mocked(validate);

  const container = render(
    <LetterTemplateForm
      initialState={mockDeep<TemplateFormState<UploadLetterTemplate>>({
        campaignId: 'campaign-id',
        errorState: undefined,
        name: undefined,
        letterType: undefined,
        language: undefined,
      })}
      campaignIds={['campaign-id']}
    />
  );
  const submitButton = screen.getByTestId('submit-button');

  await userEvent.click(submitButton);

  expect(container.asFragment()).toMatchSnapshot();
  expect(validateMock).toHaveBeenCalled();
});
