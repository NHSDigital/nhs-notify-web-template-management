import { render, screen, waitFor } from '@testing-library/react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useAuthStatus } from '@hooks/use-auth-status';
import { getIdTokenClaims } from '@utils/token-utils';
import { HeaderAccountDetails } from '../../../components/molecules/Header/HeaderAccountDetails';

jest.mock('@hooks/use-auth-status');
const useAuthStatusMock = jest.mocked(useAuthStatus);

jest.mock('aws-amplify/auth');
const fetchAuthSessionMock = jest.mocked(fetchAuthSession);

jest.mock('@utils/token-utils');
const getIdTokenClaimsMock = jest.mocked(getIdTokenClaims);

describe('HeaderAccountDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const initialAccount = { displayName: 'Jane Doe', clientName: 'NHS Trust' };

  it('renders initial account details when auth status has not changed', () => {
    useAuthStatusMock.mockReturnValue('authenticated');

    render(
      <HeaderAccountDetails
        initialAccountDetails={initialAccount}
        initialAuthStatus='authenticated'
      />
    );

    expect(screen.getByTestId('account-display-name')).toHaveTextContent(
      'Jane Doe'
    );
    expect(screen.getByTestId('account-client-name')).toHaveTextContent(
      'NHS Trust'
    );

    expect(screen.getByTestId('sign-out-link')).toHaveTextContent('Sign out');
  });

  it('clears account details and renders sign in link when auth transitions to unauthenticated', async () => {
    useAuthStatusMock.mockReturnValue('authenticated');

    const { rerender } = render(
      <HeaderAccountDetails
        initialAccountDetails={initialAccount}
        initialAuthStatus='authenticated'
      />
    );

    useAuthStatusMock.mockReturnValue('unauthenticated');

    rerender(
      <HeaderAccountDetails
        initialAccountDetails={initialAccount}
        initialAuthStatus='authenticated'
      />
    );

    await waitFor(() => {
      expect(screen.queryByTestId('account-display-name')).toBeNull();
      expect(screen.queryByTestId('account-client-name')).toBeNull();
      expect(screen.getByTestId('sign-in-link')).toHaveTextContent('Sign in');
    });
  });

  it('fetches session and updates details when auth transitions to authenticated', async () => {
    useAuthStatusMock.mockReturnValue('unauthenticated');

    const { rerender } = render(
      <HeaderAccountDetails
        initialAccountDetails={{}}
        initialAuthStatus='unauthenticated'
      />
    );

    // Prepare successful session fetch with an idToken
    const fakeIdToken = 'fake.id.token';
    fetchAuthSessionMock.mockResolvedValue({
      tokens: {
        idToken: { toString: () => fakeIdToken, payload: {} },
        accessToken: { toString: () => 'fake.access.token', payload: {} },
      },
    });

    getIdTokenClaimsMock.mockReturnValue({
      displayName: 'Alice Example',
      clientName: 'Example Clinic',
    });

    useAuthStatusMock.mockReturnValue('authenticated');
    rerender(
      <HeaderAccountDetails
        initialAccountDetails={{}}
        initialAuthStatus='unauthenticated'
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('account-display-name')).toHaveTextContent(
        'Alice Example'
      );
      expect(screen.getByTestId('account-client-name')).toHaveTextContent(
        'Example Clinic'
      );
      expect(screen.getByTestId('sign-out-link')).toHaveTextContent('Sign out');
    });

    expect(fetchAuthSessionMock).toHaveBeenCalledTimes(1);
    expect(getIdTokenClaimsMock).toHaveBeenCalledWith(fakeIdToken);
  });

  it('clears details if session has no id token', async () => {
    useAuthStatusMock.mockReturnValue('unauthenticated');

    const { rerender } = render(
      <HeaderAccountDetails
        initialAccountDetails={initialAccount}
        initialAuthStatus='unauthenticated'
      />
    );

    fetchAuthSessionMock.mockResolvedValue({
      tokens: { accessToken: { payload: {} }, idToken: undefined },
    });

    useAuthStatusMock.mockReturnValue('authenticated');
    rerender(
      <HeaderAccountDetails
        initialAccountDetails={initialAccount}
        initialAuthStatus='unauthenticated'
      />
    );

    await waitFor(() => {
      expect(screen.queryByTestId('account-display-name')).toBeNull();
      expect(screen.queryByTestId('account-client-name')).toBeNull();
      // User is still signed in even if there's no id token
      expect(screen.getByTestId('sign-out-link')).toHaveTextContent('Sign out');
    });
  });

  it('clears details on fetchAuthSession error', async () => {
    useAuthStatusMock.mockReturnValue('unauthenticated');

    const { rerender } = render(
      <HeaderAccountDetails
        initialAccountDetails={initialAccount}
        initialAuthStatus='unauthenticated'
      />
    );

    fetchAuthSessionMock.mockRejectedValue(new Error('boom'));

    useAuthStatusMock.mockReturnValue('authenticated');

    rerender(
      <HeaderAccountDetails
        initialAccountDetails={initialAccount}
        initialAuthStatus='unauthenticated'
      />
    );

    await waitFor(() => {
      expect(screen.queryByTestId('account-display-name')).toBeNull();
      expect(screen.queryByTestId('account-client-name')).toBeNull();
      expect(screen.getByTestId('sign-out-link')).toHaveTextContent('Sign out');
    });
  });

  it('does not refetch when authStatus remains the same across renders', () => {
    useAuthStatusMock.mockReturnValue('authenticated');

    fetchAuthSessionMock.mockResolvedValue({
      tokens: {
        idToken: { toString: () => 'fake.id.token', payload: {} },
        accessToken: { payload: {} },
      },
    });
    getIdTokenClaimsMock.mockReturnValue({
      displayName: 'Brian Example',
      clientName: "Brian's NHS Trust",
    });

    const { rerender } = render(
      <HeaderAccountDetails
        initialAccountDetails={initialAccount}
        initialAuthStatus='authenticated'
      />
    );

    useAuthStatusMock.mockReturnValue('authenticated');
    rerender(
      <HeaderAccountDetails
        initialAccountDetails={initialAccount}
        initialAuthStatus='authenticated'
      />
    );

    expect(fetchAuthSessionMock).not.toHaveBeenCalled();
    // Still shows initial details
    expect(screen.getByTestId('account-display-name')).toHaveTextContent(
      initialAccount.displayName
    );
    expect(screen.getByTestId('account-client-name')).toHaveTextContent(
      initialAccount.clientName
    );
  });
});
