'use client';

import { render, screen } from '@testing-library/react';
import { ReviewNHSAppTemplate } from '@forms/ReviewNHSAppTemplate';
import {
  NHSAppTemplate,
  TemplateFormState,
} from 'nhs-notify-web-template-management-utils';
import { renderNHSAppMarkdown } from '@utils/markdownit';
import { mockDeep } from 'jest-mock-extended';
import { useSearchParams } from 'next/navigation';

jest.mock('@forms/ReviewNHSAppTemplate/server-action');
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

describe('Review nhs app form renders', () => {
  it('matches snapshot when navigating from manage templates screen', () => {
    const container = render(
      <ReviewNHSAppTemplate
        initialState={mockDeep<TemplateFormState<NHSAppTemplate>>({
          validationError: undefined,
          id: 'template-id',
          name: 'test-template-nhs app',
          message: 'message',
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
      <ReviewNHSAppTemplate
        initialState={mockDeep<TemplateFormState<NHSAppTemplate>>({
          validationError: undefined,
          id: 'template-id',
          name: 'test-template-nhs app',
          message: 'message',
        })}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches error snapshot', () => {
    const container = render(
      <ReviewNHSAppTemplate
        initialState={mockDeep<TemplateFormState<NHSAppTemplate>>({
          validationError: {
            formErrors: [],
            fieldErrors: {
              reviewNHSAppTemplateAction: ['Select an option'],
            },
          },
          id: 'template-id',
          name: 'test-template-nhs app',
          message: 'message',
        })}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <ReviewNHSAppTemplate
        initialState={mockDeep<TemplateFormState<NHSAppTemplate>>({
          validationError: undefined,
          id: 'template-id',
          name: 'test-template-nhs app',
          message: 'message',
        })}
      />
    );

    expect(screen.getByTestId('nhsapp-edit-radio')).toHaveAttribute(
      'value',
      'nhsapp-edit'
    );

    expect(screen.getByTestId('nhsapp-submit-radio')).toHaveAttribute(
      'value',
      'nhsapp-submit'
    );
  });

  it('should render message with markdown', () => {
    const renderMock = jest.mocked(renderNHSAppMarkdown);

    renderMock.mockReturnValue('Rendered via MD');

    const message = 'nhs app message body';

    render(
      <ReviewNHSAppTemplate
        initialState={mockDeep<TemplateFormState<NHSAppTemplate>>({
          validationError: undefined,
          id: 'template-id',
          name: 'test-template-nhs app',
          message,
        })}
      />
    );

    expect(renderMock).toHaveBeenCalledWith(message);

    expect(screen.getByTestId('preview__content-0')).toHaveTextContent(
      'Rendered via MD'
    );
  });
});
