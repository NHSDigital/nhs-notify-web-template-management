'use client';

import { render, screen } from '@testing-library/react';
import {
  ReviewNHSAppTemplate,
  renderMarkdown,
} from '@forms/ReviewNHSAppTemplate';
import { mockDeep } from 'jest-mock-extended';
import { TemplateFormState } from '@utils/types';

jest.mock('@forms/ReviewNHSAppTemplate/server-action');

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

describe('Preview nhs app form renders', () => {
  it('matches snapshot', () => {
    const container = render(
      <ReviewNHSAppTemplate
        initialState={mockDeep<TemplateFormState>({
          validationError: undefined,
          nhsAppTemplateName: 'test-template-nhs app',
          nhsAppTemplateMessage: 'message',
        })}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches error snapshot', () => {
    const container = render(
      <ReviewNHSAppTemplate
        initialState={mockDeep<TemplateFormState>({
          validationError: {
            formErrors: [],
            fieldErrors: {
              reviewNHSAppTemplateAction: ['Select an option'],
            },
          },
          nhsAppTemplateName: 'test-template-nhs app',
          nhsAppTemplateMessage: 'message',
        })}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <ReviewNHSAppTemplate
        initialState={mockDeep<TemplateFormState>({
          validationError: undefined,
          nhsAppTemplateName: 'test-template-nhs app',
          nhsAppTemplateMessage: 'message',
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

  it('should should render message with markdown', () => {
    const renderMock = jest.mocked(renderMarkdown);

    renderMock.mockReturnValue('Rendered via MD');

    const message = 'nhs app message body';

    render(
      <ReviewNHSAppTemplate
        initialState={mockDeep<TemplateFormState>({
          validationError: undefined,
          nhsAppTemplateName: 'test-template-nhs app',
          nhsAppTemplateMessage: message,
        })}
      />
    );

    expect(renderMock).toHaveBeenCalledWith(message);

    expect(screen.getByTestId('preview__content-0')).toHaveTextContent(
      'Rendered via MD'
    );
  });
});
