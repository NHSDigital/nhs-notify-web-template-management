import { render, screen } from '@testing-library/react';
import { Preview } from '@molecules/Preview';

describe('Preview component', () => {
  it('matches snapshot', () => {
    const container = render(
      <Preview
        preview={[
          {
            heading: 'Heading',
            value: 'Test value-1',
          },
        ]}
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(
      <Preview
        preview={[
          {
            heading: 'Subject',
            value: 'Subject value',
          },
          {
            heading: 'Heading',
            value: 'Heading value',
          },
          {
            heading: 'Body text',
            value: 'Body text value',
          },
          {
            heading: 'Message',
            value: 'Message value',
          },
        ]}
      />
    );
    expect(screen.getByTestId('preview__heading-0')).toHaveTextContent(
      'Subject'
    );
    expect(screen.getByTestId('preview__content-0')).toHaveTextContent(
      'Subject value'
    );

    expect(screen.getByTestId('preview__heading-1')).toHaveTextContent(
      'Heading'
    );
    expect(screen.getByTestId('preview__content-1')).toHaveTextContent(
      'Heading value'
    );

    expect(screen.getByTestId('preview__heading-2')).toHaveTextContent(
      'Body text'
    );
    expect(screen.getByTestId('preview__content-2')).toHaveTextContent(
      'Body text value'
    );

    expect(screen.getByTestId('preview__heading-3')).toHaveTextContent(
      'Message'
    );
    expect(screen.getByTestId('preview__content-3')).toHaveTextContent(
      'Message value'
    );
  });
});
