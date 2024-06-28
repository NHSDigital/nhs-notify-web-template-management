import { render, screen } from '@testing-library/react';
import { mock } from 'jest-mock-extended';
import { PreviewLetter, PreviewLetterActions } from '@forms/PreviewLetter';

describe('Preview letter form renders', () => {
  it('matches snapshot', () => {
    const md = `
line  break

new paragraph

# Heading

## sub heading

**bold**

* bullet point 1
* bullet point 2

1. ordered list item 1
2. ordered list item 2

***

Page Break
`;

    const container = render(
      <PreviewLetter
        pageActions={new PreviewLetterActions()}
        templateName='test-template-letter'
        heading='letter heading'
        bodyText={md}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <PreviewLetter
        pageActions={new PreviewLetterActions()}
        templateName='test-template-letter'
        heading='letter subject'
        bodyText='letter message body'
      />
    );

    expect(screen.getByTestId('preview__heading-0')).toHaveTextContent(
      'Heading'
    );

    expect(screen.getByTestId('preview__content-0')).toHaveTextContent(
      'letter subject'
    );

    expect(screen.getByTestId('preview__heading-1')).toHaveTextContent(
      'Body text'
    );

    expect(screen.getByTestId('preview__content-1')).toHaveTextContent(
      'letter message body'
    );

    expect(
      screen.getByTestId('preview-letter-form__radios-edit')
    ).toHaveAttribute('value', 'edit');

    expect(
      screen.getByTestId('preview-letter-form__radios-preview')
    ).toHaveAttribute('value', 'preview');

    expect(
      screen.getByTestId('preview-letter-form__radios-submit')
    ).toHaveAttribute('value', 'submit');
  });

  it('should should render message with markdown', () => {
    const message = 'letter message body';
    const pageActionsMock = mock<PreviewLetterActions>();

    pageActionsMock.renderMarkdown.mockReturnValue('Rendered via MD');

    render(
      <PreviewLetter
        pageActions={pageActionsMock}
        templateName='test-template-letter'
        heading='letter subject'
        bodyText={message}
      />
    );

    expect(pageActionsMock.renderMarkdown).toHaveBeenCalledWith(message);

    expect(screen.getByTestId('preview__content-1')).toHaveTextContent(
      'Rendered via MD'
    );
  });
});
