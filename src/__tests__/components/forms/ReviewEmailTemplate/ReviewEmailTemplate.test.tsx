'use client';

import { render, screen } from '@testing-library/react';
import {
  ReviewEmailTemplate,
  renderMarkdown,
} from '@forms/ReviewEmailTemplate';
import { mockDeep } from 'jest-mock-extended';
import { TemplateFormState } from '@utils/types';

jest.mock('@forms/ReviewEmailTemplate/server-actions');

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

describe('Preview email form renders', () => {
  it('matches snapshot', () => {
    const container = render(
      <ReviewEmailTemplate
        initialState={mockDeep<TemplateFormState>({
          validationError: undefined,
          emailTemplateName: 'test-template-email',
          emailTemplateSubjectLine: 'template-subject-line',
          emailTemplateMessage: 'message',
          id: 'session-id',
        })}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches error snapshot', () => {
    const container = render(
      <ReviewEmailTemplate
        initialState={mockDeep<TemplateFormState>({
          validationError: {
            formErrors: [],
            fieldErrors: {
              reviewEmailTemplateAction: ['Select an option'],
            },
          },
          emailTemplateName: 'test-template-email',
          emailTemplateSubjectLine: 'template-subject-line',
          emailTemplateMessage: 'message',
          id: 'session-id',
        })}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <ReviewEmailTemplate
        initialState={mockDeep<TemplateFormState>({
          validationError: undefined,
          emailTemplateName: 'test-template-email',
          emailTemplateSubjectLine: 'template-subject-line',
          emailTemplateMessage: 'message',
          id: 'session-id',
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
    const renderMock = jest.mocked(renderMarkdown);

    renderMock.mockReturnValue('Rendered via MD');

    const message = 'email message body';

    render(
      <ReviewEmailTemplate
        initialState={mockDeep<TemplateFormState>({
          validationError: undefined,
          emailTemplateName: 'test-template-email',
          emailTemplateSubjectLine: 'template-subject-line',
          emailTemplateMessage: message,
          id: 'session-id',
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
});
