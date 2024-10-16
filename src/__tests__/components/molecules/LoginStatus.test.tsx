import { mockDeep } from 'jest-mock-extended';
import { render, waitFor } from '@testing-library/react';
import { LoginStatus } from '@molecules/LoginStatus/LoginStatus';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from '@aws-amplify/auth';

jest.mock('@aws-amplify/ui-react', () => ({
  ...jest.requireActual('@aws-amplify/ui-react'),
  useAuthenticator: jest.fn(),
}));
jest.mock('@aws-amplify/auth', () => ({
  ...jest.requireActual('@aws-amplify/auth'),
  fetchAuthSession: jest.fn(),
}));

test('LoginStatus - unauthenticated', async () => {
  jest.mocked(useAuthenticator).mockReturnValue(
    mockDeep<ReturnType<typeof useAuthenticator>>({
      authStatus: 'unauthenticated',
    })
  );
  jest.mocked(fetchAuthSession).mockResolvedValue({
    tokens: undefined,
  });

  const container = render(
    <Authenticator.Provider>
      <LoginStatus />
    </Authenticator.Provider>
  );

  await waitFor(() => container.getByText('Sign in'));
  expect(container.asFragment()).toMatchSnapshot();
});

test('LoginStatus - authenticated, no tokens', async () => {
  jest.mocked(useAuthenticator).mockReturnValue(
    mockDeep<ReturnType<typeof useAuthenticator>>({
      authStatus: 'authenticated',
    })
  );
  jest.mocked(fetchAuthSession).mockResolvedValue({
    tokens: undefined,
  });

  const container = render(
    <Authenticator.Provider>
      <LoginStatus />
    </Authenticator.Provider>
  );

  await waitFor(() => container.getByText('Sign out'));
  expect(container.asFragment()).toMatchSnapshot();
});

test('LoginStatus - authenticated', async () => {
  jest.mocked(useAuthenticator).mockReturnValue(
    mockDeep<ReturnType<typeof useAuthenticator>>({
      authStatus: 'authenticated',
    })
  );
  jest.mocked(fetchAuthSession).mockResolvedValue({
    tokens: {
      idToken: {
        payload: {
          email: 'test-user@nhs.net',
        },
      },
      accessToken: {
        payload: {},
      },
    },
  });

  const container = render(
    <Authenticator.Provider>
      <LoginStatus />
    </Authenticator.Provider>
  );

  await waitFor(() => container.getByText('Sign out'));
  expect(container.asFragment()).toMatchSnapshot();
});
