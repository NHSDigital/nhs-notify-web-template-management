import { render, screen } from '@testing-library/react';
import { mock } from 'jest-mock-extended';
import { PreviewEmail } from '@forms/PreviewEmail/PreviewEmail';
import { PreviewEmailActions } from '@forms/PreviewEmail/PreviewEmailActions';

describe('Preview email form renders', () => {
  it('matches snapshot', () => {
    const md = `
line  break

new paragraph

# Heading

## sub heading

* bullet point 1
* bullet point 2

1. ordered list item 1
2. ordered list item 2

---

Horizontal line

https://www.nhs.uk/example

[Read more](https://www.nhs.uk/example)
`;

    const container = render(
      <PreviewEmail
        pageActions={new PreviewEmailActions()}
        templateName='test-template-email'
        subject='email subject'
        message={md}
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

    expect(screen.getByTestId('preview__heading-0')).toHaveTextContent(
      'Subject'
    );

    expect(screen.getByTestId('preview__content-0')).toHaveTextContent(
      'email subject'
    );

    expect(screen.getByTestId('preview__heading-1')).toHaveTextContent(
      'Message'
    );

    expect(screen.getByTestId('preview__content-1')).toHaveTextContent(
      'email message body'
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
