import { render, screen } from '@testing-library/react';
import { mock } from 'jest-mock-extended';
import {
  PreviewTextMessage,
  PreviewTextMessageActions,
} from '@forms/PreviewTextMessage';
import { markdown } from '../fixtures';

describe('Preview sms form renders', () => {
  it('matches snapshot', () => {
    const container = render(
      <PreviewTextMessage
        pageActions={new PreviewTextMessageActions()}
        templateName='test-template-sms'
        message={markdown}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <PreviewTextMessage
        pageActions={new PreviewTextMessageActions()}
        templateName='test-template-sms'
        message='sms message body'
      />
    );

    expect(screen.getByTestId('preview-sms-form__radios-edit')).toHaveAttribute(
      'value',
      'edit'
    );

    expect(screen.getByTestId('preview-sms-form__radios-send')).toHaveAttribute(
      'value',
      'send'
    );

    expect(
      screen.getByTestId('preview-sms-form__radios-submit')
    ).toHaveAttribute('value', 'submit');
  });

  it('should should render message with markdown', () => {
    const message = 'sms message body';
    const pageActionsMock = mock<PreviewTextMessageActions>();

    pageActionsMock.renderMarkdown.mockReturnValue('Rendered via MD');

    render(
      <PreviewTextMessage
        pageActions={pageActionsMock}
        templateName='test-template-sms'
        message={message}
      />
    );

    expect(pageActionsMock.renderMarkdown).toHaveBeenCalledWith(message);

    expect(screen.getByTestId('preview__content-0')).toHaveTextContent(
      'Rendered via MD'
    );
  });
});
