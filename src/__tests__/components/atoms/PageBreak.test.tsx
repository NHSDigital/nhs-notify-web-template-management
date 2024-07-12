import { render, screen } from '@testing-library/react';
import { PageBreak } from '@atoms/PageBreak/PageBreak';

describe('Page break component', () => {
  it('matches snapshot', () => {
    const container = render(<PageBreak />);

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders component correctly', () => {
    render(<PageBreak />);

    expect(screen.getByTestId('page-break')).toBeInTheDocument();

    expect(screen.getByTestId('page-break__content')).toHaveTextContent(
      'Page Break'
    );
  });
});
