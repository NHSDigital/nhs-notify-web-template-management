import { render, screen } from '@testing-library/react';
import {
  ReviewNHSAppTemplate,
  renderMarkdown,
} from '@forms/ReviewNHSAppTemplate';
import { mockDeep } from 'jest-mock-extended';
import { FormState } from '@utils/types';

jest.mock('@forms/ReviewNHSAppTemplate/server-actions');

describe('Preview nhs app form renders', () => {
  it('matches snapshot', () => {
    const container = render(
      <ReviewNHSAppTemplate
        state={mockDeep<FormState>({
          validationError: null,
          nhsAppTemplateName: 'test-template-nhs app',
          nhsAppTemplateMessage: 'message',
        })}
        action='/action'
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('matches error snapshot', () => {
    const container = render(
      <ReviewNHSAppTemplate
        state={mockDeep<FormState>({
          validationError: {
            formErrors: [],
            fieldErrors: {
              reviewNHSAppTemplateAction: ['Select an option'],
            },
          },
          nhsAppTemplateName: 'test-template-nhs app',
          nhsAppTemplateMessage: 'message',
        })}
        action='/action'
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <ReviewNHSAppTemplate
        state={mockDeep<FormState>({
          validationError: null,
          nhsAppTemplateName: 'test-template-nhs app',
          nhsAppTemplateMessage: 'message',
        })}
        action='/action'
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
        state={mockDeep<FormState>({
          validationError: null,
          nhsAppTemplateName: 'test-template-nhs app',
          nhsAppTemplateMessage: message,
        })}
        action='/action'
      />
    );

    expect(renderMock).toHaveBeenCalledWith(message);

    expect(screen.getByTestId('preview__content-0')).toHaveTextContent(
      'Rendered via MD'
    );
  });
});
