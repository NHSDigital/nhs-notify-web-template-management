import { render, screen } from '@testing-library/react';
import { PreviewMessage } from '@organisms/PreviewMessage';

describe('PreviewMessage component', () => {
  it('matches snapshot', () => {
    const container = render(
      <PreviewMessage
        sectionHeading='NHS app message template'
        templateName='Example NHS APP template'
        details={{ heading: 'Details heading', text: ['Details text'] }}
        PreviewComponent={<>Preview</>}
        FormOptionsComponent={<>Form</>}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <PreviewMessage
        sectionHeading='Email template'
        templateName='Example template'
        details={{ heading: 'Details heading', text: ['Details text'] }}
        PreviewComponent={<>Preview</>}
        FormOptionsComponent={<>Form</>}
      />
    );

    expect(
      screen.getByTestId('preview-message__heading-caption')
    ).toHaveTextContent('Email template');

    expect(screen.getByTestId('preview-message__heading')).toHaveTextContent(
      'Example template'
    );

    expect(
      screen.getByTestId('preview-message-details__heading')
    ).toHaveTextContent('Details heading');

    expect(
      screen.getByTestId('preview-message-details__text')
    ).toHaveTextContent('Details text');

    expect(
      screen.getByTestId('preview-message-form__legend')
    ).toHaveTextContent('What would you like to do next with this template?');

    expect(
      screen.getByTestId('preview-message-form__button')
    ).toHaveTextContent('Continue');
  });
});
