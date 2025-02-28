'use client';

import { render, screen } from '@testing-library/react';
import { ReviewSMSTemplate } from '@forms/ReviewSMSTemplate';
import {
  SMSTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';
import { renderSMSMarkdown } from '@utils/markdownit';
import { mockDeep } from 'jest-mock-extended';
import { useSearchParams } from 'next/navigation';

jest.mock('@forms/ReviewSMSTemplate/server-actions');
jest.mock('@utils/markdownit');

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

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => undefined),
  })),
}));

describe('Review sms form renders', () => {
  it('matches snapshot when navigating from manage templates screen', () => {
    const container = render(
      <ReviewSMSTemplate
        initialState={mockDeep<TemplateFormState<SMSTemplate>>({
          validationError: undefined,
          name: 'test-template-sms',
          message: 'message',
          id: 'template-id',
        })}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when navigating from edit screen', () => {
    const mockSearchParams = new Map([['from', 'edit']]);
    (useSearchParams as jest.Mock).mockImplementation(() => ({
      get: (key: string) => mockSearchParams.get(key),
    }));

    const container = render(
      <ReviewSMSTemplate
        initialState={mockDeep<TemplateFormState<SMSTemplate>>({
          validationError: undefined,
          name: 'test-template-sms',
          message: 'message',
          id: 'template-id',
        })}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches error snapshot', () => {
    const container = render(
      <ReviewSMSTemplate
        initialState={mockDeep<TemplateFormState<SMSTemplate>>({
          validationError: {
            formErrors: [],
            fieldErrors: {
              reviewSMSTemplateAction: ['Select an option'],
            },
          },
          name: 'test-template-sms',
          message: 'message',
          id: 'template-id',
        })}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <ReviewSMSTemplate
        initialState={mockDeep<TemplateFormState<SMSTemplate>>({
          validationError: undefined,
          name: 'test-template-sms',
          message: 'message',
          id: 'template-id',
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

  it('should render message with markdown', () => {
    const renderMock = jest.mocked(renderSMSMarkdown);

    renderMock.mockReturnValue('Rendered via MD');

    const message = 'sms message body';

    render(
      <ReviewSMSTemplate
        initialState={mockDeep<TemplateFormState<SMSTemplate>>({
          validationError: undefined,
          name: 'test-template-sms',
          message,
          id: 'template-id',
        })}
      />
    );

    expect(renderMock).toHaveBeenCalledWith(message);

    expect(screen.getByTestId('preview__content-0')).toHaveTextContent(
      'Rendered via MD'
    );
  });
});
