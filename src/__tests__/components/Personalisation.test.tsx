import { render, screen } from '@testing-library/react';
import { Personalisation } from '@/src/components/molecules/Personalisation/Personalisation';

describe('Personalisation component', () => {
  it('renders component correctly', async () => {
    render(<Personalisation />);

    expect(screen.getByTestId('personalisation-header')).toBeInTheDocument();

    const details = screen.getByTestId('personalisation-details');
    expect(details).toBeInTheDocument();
    expect(details).not.toHaveAttribute('open');

    expect(screen.getByTestId('personalisation-summary')).toBeInTheDocument();
    expect(screen.getByTestId('personalisation-text')).toBeInTheDocument();
  });
});
