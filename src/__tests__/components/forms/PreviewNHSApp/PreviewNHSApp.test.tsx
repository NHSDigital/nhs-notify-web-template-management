import { render, screen } from '@testing-library/react';
import { PreviewNHSApp, renderMarkdown } from '@forms/PreviewNHSApp';

jest.mock('@forms/PreviewNHSApp/server-actions');

describe('Preview nhs app form renders', () => {
  it('matches snapshot', () => {
    const container = render(
      <PreviewNHSApp templateName='test-template-nhs app' message='message' />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <PreviewNHSApp
        templateName='test-template-nhs app'
        message='nhs app message body'
      />
    );

    expect(screen.getByTestId('nhsapp-edit-radio')).toHaveAttribute(
      'value',
      'nhsapp-edit'
    );

    expect(screen.getByTestId('nhsapp-submit-radio')).toHaveAttribute(
      'value',
      'nhsapp-submit'
    );
  });

  it('should should render message with markdown', () => {
    const renderMock = jest.mocked(renderMarkdown);

    renderMock.mockReturnValue('Rendered via MD');

    const message = 'nhs app message body';

    render(
      <PreviewNHSApp templateName='test-template-nhs app' message={message} />
    );

    expect(renderMock).toHaveBeenCalledWith(message);

    expect(screen.getByTestId('preview__content-0')).toHaveTextContent(
      'Rendered via MD'
    );
  });
});
