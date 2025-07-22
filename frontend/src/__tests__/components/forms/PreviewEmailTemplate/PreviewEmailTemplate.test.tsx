'use client';

import { fireEvent, render, screen } from '@testing-library/react';
import { PreviewEmailTemplate } from '@forms/PreviewEmailTemplate';
import {
  EmailTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';
import { renderEmailMarkdown } from '@utils/markdownit';
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

describe('Preview email form renders', () => {
  it('matches snapshot when navigating from manage templates screen', () => {
    const container = render(
      <PreviewEmailTemplate
        initialState={mockDeep<TemplateFormState<EmailTemplate>>({
          validationError: undefined,
          name: 'test-template-email',
          templateStatus: 'NOT_YET_SUBMITTED',
          subject: 'template-subject-line',
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
      <PreviewEmailTemplate
        initialState={mockDeep<TemplateFormState<EmailTemplate>>({
          validationError: undefined,
          name: 'test-template-email',
          templateStatus: 'NOT_YET_SUBMITTED',
          subject: 'template-subject-line',
          message: 'message',
          id: 'template-id',
        })}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches error snapshot', () => {
    const container = render(
      <PreviewEmailTemplate
        initialState={mockDeep<TemplateFormState<EmailTemplate>>({
          validationError: {
            formErrors: [],
            fieldErrors: {
              previewEmailTemplateAction: ['Select an option'],
            },
          },
          name: 'test-template-email',
          templateStatus: 'NOT_YET_SUBMITTED',
          subject: 'template-subject-line',
          message: 'message',
          id: 'template-id',
        })}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <PreviewEmailTemplate
        initialState={mockDeep<TemplateFormState<EmailTemplate>>({
          validationError: undefined,
          name: 'test-template-email',
          templateStatus: 'NOT_YET_SUBMITTED',
          subject: 'template-subject-line',
          message: 'message',
          id: 'template-id',
        })}
      />
    );

    expect(screen.getByTestId('email-edit-radio')).toHaveAttribute(
      'value',
      'email-edit'
    );

    expect(screen.getByTestId('email-submit-radio')).toHaveAttribute(
      'value',
      'email-submit'
    );
  });

  it('should should render subject line and message with markdown', () => {
    const renderMock = jest.mocked(renderEmailMarkdown);

    renderMock.mockReturnValue('Rendered via MD');

    const message = 'email message body';

    render(
      <PreviewEmailTemplate
        initialState={mockDeep<TemplateFormState<EmailTemplate>>({
          validationError: undefined,
          name: 'test-template-email',
          templateStatus: 'NOT_YET_SUBMITTED',
          subject: 'template-subject-line',
          message,
          id: 'template-id',
        })}
      />
    );

    expect(renderMock).toHaveBeenCalledWith(message);

    expect(screen.getByTestId('preview__content-0')).toHaveTextContent(
      'template-subject-line'
    );
    expect(screen.getByTestId('preview__content-1')).toHaveTextContent(
      'Rendered via MD'
    );
  });

  test('Client-side validation triggers', () => {
    const container = render(
      <PreviewEmailTemplate
        initialState={mockDeep<TemplateFormState<EmailTemplate>>({
          validationError: undefined,
          name: 'test-template-email',
          templateStatus: 'NOT_YET_SUBMITTED',
          subject: 'template-subject-line',
          message: 'message',
          id: 'template-id',
        })}
      />
    );
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    expect(container.asFragment()).toMatchSnapshot();
  });
});
