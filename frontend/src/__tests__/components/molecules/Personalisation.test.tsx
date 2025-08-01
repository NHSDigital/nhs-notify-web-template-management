import { render, screen } from '@testing-library/react';
import { Personalisation } from '@molecules/Personalisation/Personalisation';

describe('Personalisation component', () => {
  it('renders component correctly', async () => {
    render(<Personalisation />);

    expect(screen.getByTestId('personalisation-header')).toBeInTheDocument();

    const pdsDetails = screen.getByTestId('pds-personalisation-fields-details');
    expect(pdsDetails).not.toHaveAttribute('open');

    expect(screen.getByTestId('pds-personalisation-fields-summary')).toBeInTheDocument();
    expect(screen.getByTestId('pds-personalisation-fields-text')).toBeInTheDocument();

    const customDetails = screen.getByTestId('custom-personalisation-fields-details');
    expect(customDetails).not.toHaveAttribute('open');

    expect(screen.getByTestId('custom-personalisation-fields-summary')).toBeInTheDocument();
    expect(screen.getByTestId('custom-personalisation-fields-text')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<Personalisation />);
    expect(container).toMatchSnapshot();
  });
});
