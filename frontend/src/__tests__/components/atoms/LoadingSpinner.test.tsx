import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '@atoms/LoadingSpinner/LoadingSpinner';

describe('LoadingSpinner component', () => {
  it('renders component correctly', async () => {
    const container = render(
      <LoadingSpinner>
        <h1>loading text</h1>
      </LoadingSpinner>
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders a div with status role with the provided text', () => {
    render(
      <LoadingSpinner>
        <p>Processing request</p>
      </LoadingSpinner>
    );

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent('Processing request');
  });

  it('hides the spinner icon from assistive technology', () => {
    render(<LoadingSpinner>Loading</LoadingSpinner>);

    const icon = document.querySelector('span');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });
});
