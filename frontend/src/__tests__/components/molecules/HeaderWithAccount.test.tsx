import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { mockDeep } from 'jest-mock-extended';
import NhsNotifyHeaderWithAccount from '@molecules/HeaderWithAccount/HeaderWithAccount';
import { type UseAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';

jest.mock('@aws-amplify/ui-react');

const mockFetchAuthSession = jest.fn();
jest.mock('aws-amplify/auth', () => ({
  fetchAuthSession: () => mockFetchAuthSession(),
}));

const mockGetIdTokenClaims = jest.fn();
jest.mock('@utils/token-utils', () => ({
  getIdTokenClaims: (token: string) => mockGetIdTokenClaims(token),
}));

const setAuthStatus = (
  status: 'authenticated' | 'unauthenticated' | 'configuring'
) => {
  jest.mocked(useAuthenticator).mockImplementation((selector) => {
    const context = mockDeep<UseAuthenticator>({
      authStatus: status,
    });

    if (selector) {
      selector(context);
    }

    return context;
  });
};

describe('NhsNotifyHeaderWithAccount', () => {
  describe('when unauthenticated', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      setAuthStatus('unauthenticated');
    });

    it('renders the logo and service name with the correct url', () => {
      render(<NhsNotifyHeaderWithAccount />);

      const logoServiceLink = screen.getByTestId('header-logo-service-link');

      expect(logoServiceLink).toContainElement(
        screen.getByRole('img', { name: 'NHS logo' })
      );
      expect(logoServiceLink).toHaveAttribute('href', '/message-templates');
      expect(logoServiceLink).toHaveTextContent('Notify');
    });

    it(`renders the authentication link as 'sign in'`, () => {
      render(<NhsNotifyHeaderWithAccount />);

      expect(screen.getByTestId('auth-link')).toHaveTextContent('Sign in');
    });

    it('does not fetch session or claims', async () => {
      render(<NhsNotifyHeaderWithAccount />);

      await Promise.resolve();

      expect(mockFetchAuthSession).not.toHaveBeenCalled();
      expect(mockGetIdTokenClaims).not.toHaveBeenCalled();
    });

    it('matches snapshot (unauthenticated)', () => {
      const container = render(<NhsNotifyHeaderWithAccount />);

      expect(container.asFragment()).toMatchSnapshot();
    });
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      setAuthStatus('authenticated');

      mockFetchAuthSession.mockResolvedValue({
        tokens: {
          idToken: { toString: () => 'fake.id.token' },
          accessToken: { toString: () => 'fake.access.token' },
        },
      });

      mockGetIdTokenClaims.mockReturnValue({
        displayName: 'Dr Test Example',
        clientName: 'NHS England',
      });
    });

    it('renders the users display name', async () => {
      render(<NhsNotifyHeaderWithAccount />);

      await waitFor(() => {
        expect(screen.getByTestId('account-display-name')).toHaveTextContent(
          'Dr Test Example'
        );
      });
    });

    it('renders the client name', async () => {
      render(<NhsNotifyHeaderWithAccount />);

      await waitFor(() => {
        expect(screen.getByTestId('account-client-name')).toHaveTextContent(
          'NHS England'
        );
      });
    });

    it(`renders auth link as 'Sign out'`, async () => {
      render(<NhsNotifyHeaderWithAccount />);

      await waitFor(() => {
        expect(screen.getByTestId('auth-link')).toHaveTextContent('Sign out');
      });
    });

    it('handles missing id token by clearing names', async () => {
      mockFetchAuthSession.mockResolvedValueOnce({
        tokens: {
          idToken: undefined,
          accessToken: { toString: () => 'fake.access.token' },
        },
      });

      render(<NhsNotifyHeaderWithAccount />);

      await waitFor(() => {
        expect(screen.queryByTestId('account-display-name')).toBeNull();
        expect(screen.queryByTestId('account-client-name')).toBeNull();
      });
    });

    it('handles fetchAuthSession errors by clearing names', async () => {
      mockFetchAuthSession.mockRejectedValueOnce(new Error('boom'));

      render(<NhsNotifyHeaderWithAccount />);

      await waitFor(() => {
        expect(screen.queryByTestId('account-display-name')).toBeNull();
        expect(screen.queryByTestId('account-client-name')).toBeNull();
      });
    });

    it('matches snapshot (authenticated)', () => {
      const container = render(<NhsNotifyHeaderWithAccount />);

      expect(container.asFragment()).toMatchSnapshot();
    });
  });

  describe(`with 'routing' flag enabled`, () => {
    it('renders both the navigation links with correct hrefs', () => {
      render(<NhsNotifyHeaderWithAccount features={{ routing: true }} />);

      const nav = screen.getByTestId('navigation-links');

      const templatesLink = within(nav).getByRole('link', {
        name: 'Templates',
      });
      expect(templatesLink).toHaveAttribute('href', '/message-templates');

      const plansLink = within(nav).getByRole('link', {
        name: 'Message plans',
      });
      expect(plansLink).toHaveAttribute(
        'href',
        '/templates-and-message-plans/message-plans'
      );
    });
  });

  describe(`with 'routing' flag disabled`, () => {
    it('renders the templates link with correct href', () => {
      render(<NhsNotifyHeaderWithAccount features={{ routing: false }} />);

      const nav = screen.getByTestId('navigation-links');

      const templatesLink = within(nav).getByRole('link', {
        name: 'Templates',
      });
      expect(templatesLink).toHaveAttribute('href', '/message-templates');
    });

    it('should not render the message plans link', () => {
      render(<NhsNotifyHeaderWithAccount features={{ routing: false }} />);

      const nav = screen.getByTestId('navigation-links');

      const plansLink = within(nav).queryByRole('link', {
        name: 'Message plans',
      });
      expect(plansLink).not.toBeInTheDocument();
    });
  });
});
