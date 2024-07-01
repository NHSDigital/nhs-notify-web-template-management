import { render, screen } from '@testing-library/react';
import { PreviewEmail, renderMarkdown } from '@forms/PreviewEmail';

jest.mock('@forms/PreviewEmail/server-actions');

describe('Preview email form renders', () => {
  it('matches snapshot', () => {
    const container = render(
      <PreviewEmail
        templateName='test-template-email'
        subject='email subject'
        message='message'
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <PreviewEmail
        templateName='test-template-email'
        subject='email subject'
        message='email message body'
      />
    );

    expect(
      screen.getByTestId('preview-email-form__radios-edit')
    ).toHaveAttribute('value', 'edit');

    expect(
      screen.getByTestId('preview-email-form__radios-send')
    ).toHaveAttribute('value', 'send');

    expect(
      screen.getByTestId('preview-email-form__radios-submit')
    ).toHaveAttribute('value', 'submit');
  });

  it('should should render message with markdown', () => {
    const renderMock = jest.mocked(renderMarkdown);

    renderMock.mockReturnValue('Rendered via MD');

    const message = 'email message body';

    render(
      <PreviewEmail
        templateName='test-template-email'
        subject='email subject'
        message={message}
      />
    );

    expect(renderMock).toHaveBeenCalledWith(message);

    expect(screen.getByTestId('preview__content-1')).toHaveTextContent(
      'Rendered via MD'
    );
  });
});
