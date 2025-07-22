'use client';

import { fireEvent, render, screen } from '@testing-library/react';
import { PreviewSMSTemplate } from '@forms/PreviewSMSTemplate';
import {
  SMSTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';
import { renderSMSMarkdown } from '@utils/markdownit';
import { mockDeep } from 'jest-mock-extended';
import { useSearchParams } from 'next/navigation';

jest.mock('@utils/markdownit');

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

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => undefined),
  })),
}));

describe('Review sms form renders', () => {
  it('matches snapshot when navigating from manage templates screen', () => {
    const container = render(
      <PreviewSMSTemplate
        initialState={mockDeep<TemplateFormState<SMSTemplate>>({
          validationError: undefined,
          name: 'test-template-sms',
          templateStatus: 'NOT_YET_SUBMITTED',
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
      <PreviewSMSTemplate
        initialState={mockDeep<TemplateFormState<SMSTemplate>>({
          validationError: undefined,
          name: 'test-template-sms',
          templateStatus: 'NOT_YET_SUBMITTED',
          message: 'message',
          id: 'template-id',
        })}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches error snapshot', () => {
    const container = render(
      <PreviewSMSTemplate
        initialState={mockDeep<TemplateFormState<SMSTemplate>>({
          validationError: {
            formErrors: [],
            fieldErrors: {
              previewSMSTemplateAction: ['Select an option'],
            },
          },
          name: 'test-template-sms',
          templateStatus: 'NOT_YET_SUBMITTED',
          message: 'message',
          id: 'template-id',
        })}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <PreviewSMSTemplate
        initialState={mockDeep<TemplateFormState<SMSTemplate>>({
          validationError: undefined,
          name: 'test-template-sms',
          templateStatus: 'NOT_YET_SUBMITTED',
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
      <PreviewSMSTemplate
        initialState={mockDeep<TemplateFormState<SMSTemplate>>({
          validationError: undefined,
          name: 'test-template-sms',
          templateStatus: 'NOT_YET_SUBMITTED',
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

  test('Client-side validation triggers', () => {
    const container = render(
      <PreviewSMSTemplate
        initialState={mockDeep<TemplateFormState<SMSTemplate>>({
          name: 'test-template-sms',
          templateStatus: 'NOT_YET_SUBMITTED',
          message: 'example',
          id: 'template-id',
        })}
      />
    );
    const submitButton = screen.getByRole('button');
    fireEvent.click(submitButton);
    expect(container.asFragment()).toMatchSnapshot();
  });
});
