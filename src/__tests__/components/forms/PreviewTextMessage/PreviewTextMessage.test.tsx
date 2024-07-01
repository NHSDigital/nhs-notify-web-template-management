import { render, screen } from '@testing-library/react';
import { PreviewTextMessage, renderMarkdown } from '@forms/PreviewTextMessage';

jest.mock('@forms/PreviewTextMessage/server-actions');

describe('Preview sms form renders', () => {
  it('matches snapshot', () => {
    const container = render(
      <PreviewTextMessage templateName='test-template-sms' message='message' />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <PreviewTextMessage
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
    const renderMock = jest.mocked(renderMarkdown);

    renderMock.mockReturnValue('Rendered via MD');

    const message = 'sms message body';
    render(
      <PreviewTextMessage templateName='test-template-sms' message={message} />
    );

    expect(renderMock).toHaveBeenCalledWith(message);

    expect(screen.getByTestId('preview__content-0')).toHaveTextContent(
      'Rendered via MD'
    );
  });
});
