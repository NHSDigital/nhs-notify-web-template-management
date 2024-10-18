import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockDeep } from 'jest-mock-extended';
import { TemplateFormState } from '@utils/types';
import { CreateSmsTemplate } from '@forms/CreateSmsTemplate/CreateSmsTemplate';

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

jest.mock('@utils/amplify-utils', () => ({
  getAmplifyBackendClient: () => {},
}));

describe('CreateSmsTemplate component', () => {
  test('renders page', async () => {
    const container = render(
      <CreateSmsTemplate
        initialState={mockDeep<TemplateFormState>({
          validationError: undefined,
          smsTemplateName: '',
          smsTemplateMessage: '',
          id: 'session-id',
        })}
      />
    );
    expect(container.asFragment()).toMatchSnapshot();
  });

  test('renders page with preloaded field values', () => {
    const container = render(
      <CreateSmsTemplate
        initialState={mockDeep<TemplateFormState>({
          validationError: undefined,
          smsTemplateName: 'template-name',
          smsTemplateMessage: 'template-message',
          id: 'session-id',
        })}
      />
    );
    expect(container.asFragment()).toMatchSnapshot();
  });

  test('renders page one error', () => {
    const container = render(
      <CreateSmsTemplate
        initialState={mockDeep<TemplateFormState>({
          validationError: {
            formErrors: [],
            fieldErrors: {
              smsTemplateName: ['Template name error'],
            },
          },
          smsTemplateName: undefined,
          smsTemplateMessage: undefined,
        })}
      />
    );
    expect(container.asFragment()).toMatchSnapshot();
  });

  test('renders page with multiple errors', () => {
    const container = render(
      <CreateSmsTemplate
        initialState={mockDeep<TemplateFormState>({
          validationError: {
            formErrors: [],
            fieldErrors: {
              smsTemplateName: ['Template name error'],
              smsTemplateMessage: ['Template message error'],
            },
          },
          id: 'session-id',
          smsTemplateName: undefined,
          smsTemplateMessage: undefined,
        })}
      />
    );
    expect(container.asFragment()).toMatchSnapshot();
  });

  test('it renders expected character count', async () => {
    const user = userEvent.setup();

    render(
      <CreateSmsTemplate
        initialState={mockDeep<TemplateFormState>({
          validationError: undefined,
          smsTemplateName: '',
          smsTemplateMessage: '',
          id: 'session-id',
        })}
      />
    );

    const templateMessageBox = document.querySelector('#smsTemplateMessage');

    if (!templateMessageBox) {
      throw new Error('Template name box not found');
    }

    const longMessage = 'x'.repeat(300);

    await user.type(templateMessageBox, longMessage);

    const characterCount = document.querySelector('#smsMessageCharacterCount');

    if (!characterCount) {
      throw new Error('Template name box not found');
    }

    expect(characterCount.textContent).toContain(
      `${longMessage.length} characters`
    );
  });
});
