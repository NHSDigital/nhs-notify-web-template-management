'use client';

import { render, screen } from '@testing-library/react';
import { ReviewSMSTemplate, renderMarkdown } from '@forms/ReviewSMSTemplate';
import { mockDeep } from 'jest-mock-extended';
import { TemplateFormState } from '@utils/types';

jest.mock('@forms/ReviewSMSTemplate/server-actions');

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

describe('Preview sms form renders', () => {
  it('matches snapshot', () => {
    const container = render(
      <ReviewSMSTemplate
        initialState={mockDeep<TemplateFormState>({
          validationError: undefined,
          smsTemplateName: 'test-template-sms',
          smsTemplateMessage: 'message',
          id: 'session-id',
        })}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches error snapshot', () => {
    const container = render(
      <ReviewSMSTemplate
        initialState={mockDeep<TemplateFormState>({
          validationError: {
            formErrors: [],
            fieldErrors: {
              reviewSMSTemplateAction: ['Select an option'],
            },
          },
          smsTemplateName: 'test-template-sms',
          smsTemplateMessage: 'message',
          id: 'session-id',
        })}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <ReviewSMSTemplate
        initialState={mockDeep<TemplateFormState>({
          validationError: undefined,
          smsTemplateName: 'test-template-sms',
          smsTemplateMessage: 'message',
          id: 'session-id',
        })}
      />
    );

    expect(screen.getByTestId('sms-edit-radio')).toHaveAttribute(
      'value',
      'sms-edit'
    );

    expect(screen.getByTestId('sms-submit-radio')).toHaveAttribute(
      'value',
      'sms-submit'
    );
  });

  it('should should render message with markdown', () => {
    const renderMock = jest.mocked(renderMarkdown);

    renderMock.mockReturnValue('Rendered via MD');

    const message = 'sms message body';

    render(
      <ReviewSMSTemplate
        initialState={mockDeep<TemplateFormState>({
          validationError: undefined,
          smsTemplateName: 'test-template-sms',
          smsTemplateMessage: message,
          id: 'session-id',
        })}
      />
    );

    expect(renderMock).toHaveBeenCalledWith(message);

    expect(screen.getByTestId('preview__content-0')).toHaveTextContent(
      'Rendered via MD'
    );
  });
});
