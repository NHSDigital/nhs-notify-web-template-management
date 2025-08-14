import React from 'react';
import { render, screen, within } from '@testing-library/react';
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

    it('renders the logo and service name with the correct url', async () => {
      render(<NhsNotifyHeaderWithAccount />);

      const logoServiceLink = await screen.findByTestId(
        'header-logo-service-link'
      );

      expect(logoServiceLink).toContainElement(
        screen.getByRole('img', { name: 'NHS logo' })
      );
      expect(logoServiceLink).toHaveAttribute('href', '/message-templates');
      expect(logoServiceLink).toHaveTextContent('Notify');
    });

    it(`renders the authentication link as 'sign in'`, async () => {
      render(<NhsNotifyHeaderWithAccount />);

      expect(await screen.findByTestId('sign-in-link')).toHaveTextContent(
        'Sign in'
      );
    });

    it('does not fetch session or claims', async () => {
      render(<NhsNotifyHeaderWithAccount />);

      await screen.findByTestId('page-header');

      expect(mockFetchAuthSession).not.toHaveBeenCalled();
      expect(mockGetIdTokenClaims).not.toHaveBeenCalled();
    });

    it('matches snapshot (unauthenticated)', async () => {
      const container = render(<NhsNotifyHeaderWithAccount />);

      await screen.findByTestId('page-header');

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

      expect(
        await screen.findByTestId('account-display-name')
      ).toHaveTextContent('Dr Test Example');
    });

    it('renders the client name', async () => {
      render(<NhsNotifyHeaderWithAccount />);

      expect(
        await screen.findByTestId('account-client-name')
      ).toHaveTextContent('NHS England');
    });

    it(`renders auth link as 'Sign out'`, async () => {
      render(<NhsNotifyHeaderWithAccount />);

      expect(await screen.findByTestId('sign-out-link')).toHaveTextContent(
        'Sign out'
      );
    });

    it('handles missing id token by clearing names', async () => {
      mockFetchAuthSession.mockResolvedValueOnce({
        tokens: {
          idToken: undefined,
          accessToken: { toString: () => 'fake.access.token' },
        },
      });

      render(<NhsNotifyHeaderWithAccount />);

      await screen.findByTestId('page-header');

      expect(screen.queryByTestId('account-display-name')).toBeNull();
      expect(screen.queryByTestId('account-client-name')).toBeNull();
    });

    it('handles fetchAuthSession errors by clearing names', async () => {
      mockFetchAuthSession.mockRejectedValueOnce(new Error('boom'));

      render(<NhsNotifyHeaderWithAccount />);

      await screen.findByTestId('page-header');

      expect(screen.queryByTestId('account-display-name')).toBeNull();
      expect(screen.queryByTestId('account-client-name')).toBeNull();
    });

    it('matches snapshot (authenticated)', async () => {
      const container = render(<NhsNotifyHeaderWithAccount />);

      await screen.findByTestId('page-header');

      expect(container.asFragment()).toMatchSnapshot();
    });
  });

  describe(`with 'routing' flag enabled`, () => {
    it('renders both the navigation links with correct hrefs', async () => {
      render(<NhsNotifyHeaderWithAccount features={{ routing: true }} />);

      await screen.findByTestId('page-header');

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
    it('renders the templates link with correct href', async () => {
      render(<NhsNotifyHeaderWithAccount features={{ routing: false }} />);

      await screen.findByTestId('page-header');

      const nav = screen.getByTestId('navigation-links');

      const templatesLink = within(nav).getByRole('link', {
        name: 'Templates',
      });
      expect(templatesLink).toHaveAttribute('href', '/message-templates');
    });

    it('should not render the message plans link', async () => {
      render(<NhsNotifyHeaderWithAccount features={{ routing: false }} />);

      await screen.findByTestId('page-header');

      const nav = screen.getByTestId('navigation-links');

      const plansLink = within(nav).queryByRole('link', {
        name: 'Message plans',
      });
      expect(plansLink).not.toBeInTheDocument();
    });
  });
});
