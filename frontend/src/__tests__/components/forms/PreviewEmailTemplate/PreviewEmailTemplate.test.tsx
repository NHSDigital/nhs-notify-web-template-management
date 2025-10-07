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
import { useClientConfig } from '@providers/client-config-provider';

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

jest.mock('@providers/client-config-provider');

beforeEach(() => {
  jest.mocked(useClientConfig).mockReset().mockReturnValue({ features: {} });
});

describe('Preview email form renders', () => {
  describe('Routing feature flag - Disabled', () => {
    beforeEach(() => {
      jest
        .mocked(useClientConfig)
        .mockReturnValue({ features: { routing: false } });
    });

    it('matches error snapshot', () => {
      const container = render(
        <PreviewEmailTemplate
          initialState={mockDeep<TemplateFormState<EmailTemplate>>({
            errorState: {
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
            errorState: undefined,
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

    test('Client-side validation triggers', () => {
      const container = render(
        <PreviewEmailTemplate
          initialState={mockDeep<TemplateFormState<EmailTemplate>>({
            errorState: undefined,
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

  describe('Routing feature flag - Enabled', () => {
    beforeEach(() => {
      jest
        .mocked(useClientConfig)
        .mockReturnValue({ features: { routing: true } });
    });

    it('renders component correctly', () => {
      render(
        <PreviewEmailTemplate
          initialState={mockDeep<TemplateFormState<EmailTemplate>>({
            errorState: undefined,
            name: 'test-template-email',
            templateStatus: 'NOT_YET_SUBMITTED',
            subject: 'template-subject-line',
            message: 'message',
            id: 'template-id',
          })}
        />
      );

      expect(screen.getByTestId('edit-template-button')).toHaveAttribute(
        'href',
        '/edit-email-template/template-id'
      );
    });
  });

  it.each([true, false])(
    'matches snapshot when navigating from manage templates screen, when routing is %p',
    (routing) => {
      jest.mocked(useClientConfig).mockReturnValue({ features: { routing } });

      const container = render(
        <PreviewEmailTemplate
          initialState={mockDeep<TemplateFormState<EmailTemplate>>({
            errorState: undefined,
            name: 'test-template-email',
            templateStatus: 'NOT_YET_SUBMITTED',
            subject: 'template-subject-line',
            message: 'message',
            id: 'template-id',
          })}
        />
      );

      expect(container.asFragment()).toMatchSnapshot();
    }
  );

  it.each([true, false])(
    'matches snapshot when navigating from edit screen when routing is %p',
    (routing) => {
      jest.mocked(useClientConfig).mockReturnValue({ features: { routing } });

      const mockSearchParams = new Map([['from', 'edit']]);
      (useSearchParams as jest.Mock).mockImplementationOnce(() => ({
        get: (key: string) => mockSearchParams.get(key),
      }));

      const container = render(
        <PreviewEmailTemplate
          initialState={mockDeep<TemplateFormState<EmailTemplate>>({
            errorState: undefined,
            name: 'test-template-email',
            templateStatus: 'NOT_YET_SUBMITTED',
            subject: 'template-subject-line',
            message: 'message',
            id: 'template-id',
          })}
        />
      );

      expect(container.asFragment()).toMatchSnapshot();
    }
  );

  it('should should render subject line and message with markdown', () => {
    const renderMock = jest.mocked(renderEmailMarkdown);

    renderMock.mockReturnValue('Rendered via MD');

    const message = 'email message body';

    render(
      <PreviewEmailTemplate
        initialState={mockDeep<TemplateFormState<EmailTemplate>>({
          errorState: undefined,
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
});
