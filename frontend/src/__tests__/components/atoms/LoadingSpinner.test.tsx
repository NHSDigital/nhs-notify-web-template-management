import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '@atoms/LoadingSpinner/LoadingSpinner';

describe('LoadingSpinner component', () => {
  it('renders component correctly', async () => {
    const container = render(<LoadingSpinner text='loading text' />);

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders a status region with the provided text', () => {
    render(<LoadingSpinner text='Processing request' />);

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent('Processing request');
  });

  it('hides the spinner icon from assistive technology', () => {
    const { container } = render(<LoadingSpinner text='Loading' />);

    const spinner = container.querySelector('[aria-hidden="true"]');
    expect(spinner).toBeInTheDocument();
  });
});
