import { render, screen } from '@testing-library/react';
import {
  ReviewNHSAppTemplate,
  renderMarkdown,
} from '@forms/ReviewNHSAppTemplate';

jest.mock('@forms/ReviewNHSAppTemplate/server-actions');

describe('Preview nhs app form renders', () => {
  it('matches snapshot', () => {
    const container = render(
      <ReviewNHSAppTemplate
        templateName='test-template-nhs app'
        message='message'
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <ReviewNHSAppTemplate
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
      <ReviewNHSAppTemplate
        templateName='test-template-nhs app'
        message={message}
      />
    );

    expect(renderMock).toHaveBeenCalledWith(message);

    expect(screen.getByTestId('preview__content-0')).toHaveTextContent(
      'Rendered via MD'
    );
  });
});
