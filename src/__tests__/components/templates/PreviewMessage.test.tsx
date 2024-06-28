import { render, screen } from '@testing-library/react';
import { PreviewMessage, PREVIEW_TYPES } from '@templates/PreviewMessage';

describe('PreviewMessage component', () => {
  it('matches snapshot', () => {
    const container = render(
      <PreviewMessage
        type='NHS app message'
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
        type='Email'
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

  it.each(PREVIEW_TYPES)('renders type %s correctly', (type) => {
    render(
      <PreviewMessage
        type={type}
        templateName='Example template'
        details={{ heading: 'Details heading', text: ['Details text'] }}
        PreviewComponent={<>Preview</>}
        FormOptionsComponent={<>Form</>}
      />
    );

    expect(
      screen.getByTestId('preview-message__heading-caption')
    ).toHaveTextContent(`${type} template`);
  });
});
