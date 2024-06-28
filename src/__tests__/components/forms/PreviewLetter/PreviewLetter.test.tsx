import { render, screen } from '@testing-library/react';
import { mock } from 'jest-mock-extended';
import { PreviewLetter, PreviewLetterActions } from '@forms/PreviewLetter';
import { markdown } from '../fixtures';

describe('Preview letter form renders', () => {
  it('matches snapshot', () => {
    const container = render(
      <PreviewLetter
        pageActions={new PreviewLetterActions()}
        templateName='test-template-letter'
        heading='letter heading'
        bodyText={markdown}
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
