import { render, screen } from '@testing-library/react';
import { useAuthStatus } from '@hooks/use-auth-status';
import { AuthLink } from '@molecules/AuthLink/AuthLink';

jest.mock('@hooks/use-auth-status');
const mockUseAuthStatus = jest.mocked(useAuthStatus);

beforeEach(() => {
  jest.resetAllMocks();
  mockUseAuthStatus.mockReturnValue('configuring');
});

describe('AuthLink', () => {
  it('renders Sign in link when authStatus is configuring', async () => {
    const container = render(<AuthLink />);

    await screen.findByText('Sign in');

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders Sign in link when authStatus changes to unauthenticated', async () => {
    const container = render(<AuthLink />);

    await screen.findByText('Sign in');

    mockUseAuthStatus.mockReturnValue('unauthenticated');

    container.rerender(<AuthLink />);

    await screen.findByText('Sign in');

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders Sign out link when authStatus changes to authenticated', async () => {
    const container = render(<AuthLink />);

    await screen.findByText('Sign in');

    mockUseAuthStatus.mockReturnValue('authenticated');

    container.rerender(<AuthLink />);

    await screen.findByText('Sign out');

    expect(container.asFragment()).toMatchSnapshot();
  });
});
