import { render, screen } from '@testing-library/react';
import { mockDeep } from 'jest-mock-extended';
import { type UseAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { AuthLink } from '@molecules/AuthLink/AuthLink';

jest.mock('@aws-amplify/ui-react');

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(useAuthenticator).mockImplementation((cb) => {
    const context = mockDeep<UseAuthenticator>({
      authStatus: 'configuring',
    });

    if (cb) {
      cb(context);
    }

    return context;
  });
});

describe('AuthLink', () => {
  it('renders Log in link when authStatus is configuring', async () => {
    const container = render(<AuthLink />);

    await screen.findByText('Log in');

    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders Log in link when authStatus is unauthenticated', async () => {
    jest.mocked(useAuthenticator).mockReturnValueOnce(
      mockDeep<UseAuthenticator>({
        authStatus: 'unauthenticated',
      })
    );

    const container = render(<AuthLink />);

    await screen.findByText('Log in');

    expect(container.asFragment()).toMatchSnapshot();
  });
  it('renders Log out link when authStatus is authenticated', async () => {
    jest.mocked(useAuthenticator).mockReturnValueOnce(
      mockDeep<UseAuthenticator>({
        authStatus: 'authenticated',
      })
    );

    const container = render(<AuthLink />);

    await screen.findByText('Log out');

    expect(container.asFragment()).toMatchSnapshot();
  });
});
