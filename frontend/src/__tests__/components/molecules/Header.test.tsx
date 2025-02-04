import { render, screen } from '@testing-library/react';
import { mockDeep } from 'jest-mock-extended';
import { type UseAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { NHSNotifyHeader } from '@molecules/Header/Header';

jest.mock('@aws-amplify/ui-react');

jest.mocked(useAuthenticator).mockReturnValue(
  mockDeep<UseAuthenticator>({
    authStatus: 'configuring',
  })
);

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
    expect(screen.getByTestId('sign-in-link')).toBeInTheDocument();
  });

  it('should not render sign in link', () => {
    process.env.NEXT_PUBLIC_DISABLE_CONTENT = 'true';

    render(<NHSNotifyHeader />);

    expect(screen.queryByTestId('sign-in-link')).not.toBeInTheDocument();
  });
});
