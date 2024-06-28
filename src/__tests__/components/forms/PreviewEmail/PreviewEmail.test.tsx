import { render, screen } from '@testing-library/react';
import { mock } from 'jest-mock-extended';
import { PreviewEmail, PreviewEmailActions } from '@forms/PreviewEmail';
import { markdown } from '../fixtures';

describe('Preview email form renders', () => {
  it('matches snapshot', () => {
    const container = render(
      <PreviewEmail
        pageActions={new PreviewEmailActions()}
        templateName='test-template-email'
        subject='email subject'
        message={markdown}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <PreviewEmail
        pageActions={new PreviewEmailActions()}
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
    const message = 'email message body';
    const pageActionsMock = mock<PreviewEmailActions>();

    pageActionsMock.renderMarkdown.mockReturnValue('Rendered via MD');

    render(
      <PreviewEmail
        pageActions={pageActionsMock}
        templateName='test-template-email'
        subject='email subject'
        message={message}
      />
    );

    expect(pageActionsMock.renderMarkdown).toHaveBeenCalledWith(message);

    expect(screen.getByTestId('preview__content-1')).toHaveTextContent(
      'Rendered via MD'
    );
  });
});
