import { render, screen } from '@testing-library/react';
import { mock } from 'jest-mock-extended';
import { PreviewNHSApp, PreviewNHSAppActions } from '@forms/PreviewNHSApp';

describe('Preview nhs app form renders', () => {
  it('matches snapshot', () => {
    const md = `
line  break

new paragraph

# Heading

## sub heading

**bold**

https://www.nhs.uk/example

[Read more](https://www.nhs.uk/example)
`;

    const container = render(
      <PreviewNHSApp
        pageActions={new PreviewNHSAppActions()}
        templateName='test-template-nhs app'
        message={md}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <PreviewNHSApp
        pageActions={new PreviewNHSAppActions()}
        templateName='test-template-nhs app'
        message='nhs app message body'
      />
    );

    expect(screen.getByTestId('preview__heading-0')).toHaveTextContent(
      'Message'
    );

    expect(screen.getByTestId('preview__content-0')).toHaveTextContent(
      'nhs app message body'
    );

    expect(
      screen.getByTestId('preview-nhs-app-form__radios-edit')
    ).toHaveAttribute('value', 'edit');

    expect(
      screen.getByTestId('preview-nhs-app-form__radios-submit')
    ).toHaveAttribute('value', 'submit');
  });

  it('should should render message with markdown', () => {
    const message = 'nhs app message body';
    const pageActionsMock = mock<PreviewNHSAppActions>();

    pageActionsMock.renderMarkdown.mockReturnValue('Rendered via MD');

    render(
      <PreviewNHSApp
        pageActions={pageActionsMock}
        templateName='test-template-nhs app'
        message={message}
      />
    );

    expect(pageActionsMock.renderMarkdown).toHaveBeenCalledWith(message);

    expect(screen.getByTestId('preview__content-0')).toHaveTextContent(
      'Rendered via MD'
    );
  });
});
