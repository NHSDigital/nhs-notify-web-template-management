import { render, screen } from '@testing-library/react';
import { PreviewLetter, renderMarkdown } from '@forms/PreviewLetter';

jest.mock('@forms/PreviewLetter/server-actions');

describe('Preview letter form renders', () => {
  it('matches snapshot', () => {
    const container = render(
      <PreviewLetter
        templateName='test-template-letter'
        heading='letter heading'
        bodyText='body text'
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <PreviewLetter
        templateName='test-template-letter'
        heading='letter subject'
        bodyText='letter message body'
      />
    );

    expect(screen.getByTestId('letter-edit-radio')).toHaveAttribute(
      'value',
      'letter-edit'
    );

    expect(screen.getByTestId('letter-preview-radio')).toHaveAttribute(
      'value',
      'letter-preview'
    );

    expect(screen.getByTestId('letter-submit-radio')).toHaveAttribute(
      'value',
      'letter-submit'
    );
  });

  it('should should render message with markdown', () => {
    const renderMock = jest.mocked(renderMarkdown);

    renderMock.mockReturnValue('Rendered via MD');

    const message = 'email message body';

    render(
      <PreviewLetter
        templateName='test-template-letter'
        heading='letter subject'
        bodyText={message}
      />
    );

    expect(renderMock).toHaveBeenCalledWith(message);

    expect(screen.getByTestId('preview__content-1')).toHaveTextContent(
      'Rendered via MD'
    );
  });
});
