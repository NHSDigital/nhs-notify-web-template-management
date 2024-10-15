import { render, screen } from '@testing-library/react';
import { NHSNotifyHeader } from '@molecules/Header/Header';

describe('Header component', () => {
  const ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ENV };
  });

  afterAll(() => {
    process.env = ENV;
  });

  it('renders component correctly', () => {
    render(<NHSNotifyHeader />);

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByTestId('page-header-logo')).toBeInTheDocument();
    expect(screen.getByTestId('login-link')).toBeInTheDocument();
  });

  it('should not render login link', () => {
    process.env.NEXT_PUBLIC_FEATURE_VISIBILITY_TESTING = 'on';
    render(<NHSNotifyHeader />);

    expect(screen.queryByTestId('login-link')).not.toBeInTheDocument();
  });
});
