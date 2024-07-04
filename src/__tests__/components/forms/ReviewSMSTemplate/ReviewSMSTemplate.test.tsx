import { render, screen } from '@testing-library/react';
import { ReviewSMSTemplate, renderMarkdown } from '@forms/ReviewSMSTemplate';

jest.mock('@forms/PreviewTextMessage/server-actions');

describe('Preview sms form renders', () => {
  it('matches snapshot', () => {
    const container = render(
      <ReviewSMSTemplate templateName='test-template-sms' message='message' />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <ReviewSMSTemplate
        templateName='test-template-sms'
        message='sms message body'
      />
    );

    expect(screen.getByTestId('sms-edit-radio')).toHaveAttribute(
      'value',
      'sms-edit'
    );

    expect(screen.getByTestId('sms-send-radio')).toHaveAttribute(
      'value',
      'sms-send'
    );

    expect(screen.getByTestId('sms-submit-radio')).toHaveAttribute(
      'value',
      'sms-submit'
    );
  });

  it('should should render message with markdown', () => {
    const renderMock = jest.mocked(renderMarkdown);

    renderMock.mockReturnValue('Rendered via MD');

    const message = 'sms message body';
    render(
      <ReviewSMSTemplate templateName='test-template-sms' message={message} />
    );

    expect(renderMock).toHaveBeenCalledWith(message);

    expect(screen.getByTestId('preview__content-0')).toHaveTextContent(
      'Rendered via MD'
    );
  });
});
