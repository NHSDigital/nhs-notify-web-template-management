import { render, screen, within } from '@testing-library/react';
import { useAuthStatus } from '@hooks/use-auth-status';
import { getSessionServer } from '@utils/amplify-utils';
import { getIdTokenClaims } from '@utils/token-utils';
import { NhsNotifyHeader } from '@molecules/Header/Header';

jest.mock('@hooks/use-auth-status');
const mockUseAuthStatus = jest.mocked(useAuthStatus);

jest.mock('@utils/token-utils');
const mockGetIdTokenClaims = jest.mocked(getIdTokenClaims);

jest.mock('@utils/amplify-utils');
const mockGetSessionServer = jest.mocked(getSessionServer);

jest.mock('nhs-notify-web-template-management-utils/logger');

beforeEach(() => {
  jest.resetAllMocks();
  mockUseAuthStatus.mockImplementation((status) => status ?? 'configuring');
});

describe('NhsNotifyHeader', () => {
  describe('when unauthenticated', () => {
    beforeEach(() => {
      mockGetSessionServer.mockResolvedValue({});
      mockGetIdTokenClaims.mockReturnValue({});
    });

    it('initializes the authStatus as unauthenticated', async () => {
      const header = await NhsNotifyHeader({});

      render(header);

      expect(mockUseAuthStatus).toHaveBeenCalledTimes(3);

      for (const call of mockUseAuthStatus.mock.calls) {
        expect(call[0]).toBe('unauthenticated');
      }
    });

    it('renders the logo and service name with the correct url', async () => {
      const header = await NhsNotifyHeader({});

      render(header);

      const logoServiceLink = screen.getByTestId('header-logo-service-link');

      expect(logoServiceLink).toContainElement(
        screen.getByRole('img', { name: 'NHS logo' })
      );
      expect(logoServiceLink).toHaveAttribute('href', '/message-templates');
      expect(logoServiceLink).toHaveTextContent('Notify');
    });

    it(`renders the authentication link as 'sign in'`, async () => {
      const header = await NhsNotifyHeader({});

      render(header);

      expect(screen.getByTestId('sign-in-link')).toHaveTextContent('Sign in');
    });

    it('does not show the navigation links', async () => {
      const header = await NhsNotifyHeader({});

      render(header);

      expect(screen.getByTestId('page-header')).toBeVisible();

      expect(screen.queryByTestId('navigation-links')).not.toBeInTheDocument();
    });

    it('matches snapshot (unauthenticated)', async () => {
      const header = await NhsNotifyHeader({});

      const container = render(header);

      expect(container.asFragment()).toMatchSnapshot();
    });
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      mockGetSessionServer.mockResolvedValue({
        accessToken: 'fake.access.token',
        idToken: 'fake.id.token',
      });

      mockGetIdTokenClaims.mockReturnValue({
        displayName: 'Dr Test Example',
        clientName: 'NHS England',
      });
    });

    it('initializes the authStatus as authenticated', async () => {
      const header = await NhsNotifyHeader({});

      render(header);

      // hook used in AuthLink, HeaderNavigation, HeaderAccountDetails
      expect(mockUseAuthStatus).toHaveBeenCalledTimes(3);

      for (const call of mockUseAuthStatus.mock.calls) {
        expect(call[0]).toBe('authenticated');
      }
    });

    it('renders the users display name', async () => {
      const header = await NhsNotifyHeader({});

      render(header);

      expect(screen.getByTestId('account-display-name')).toHaveTextContent(
        'Dr Test Example'
      );
    });

    it('renders the client name', async () => {
      const header = await NhsNotifyHeader({});

      render(header);

      expect(screen.getByTestId('account-client-name')).toHaveTextContent(
        'NHS England'
      );
    });

    it(`renders auth link as 'Sign out'`, async () => {
      const header = await NhsNotifyHeader({});

      render(header);
      expect(screen.getByTestId('sign-out-link')).toHaveTextContent('Sign out');
    });

    it('does not render names but renders sign out link and navigation when id token is missing', async () => {
      mockGetSessionServer.mockResolvedValueOnce({
        accessToken: 'fake.access.token',
      });
      mockGetIdTokenClaims.mockReturnValueOnce({});

      const header = await NhsNotifyHeader({});

      render(header);

      expect(
        screen.queryByTestId('account-display-name')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('account-client-name')
      ).not.toBeInTheDocument();
      expect(screen.getByTestId('sign-out-link')).toHaveTextContent('Sign out');
      expect(screen.getByTestId('navigation-links')).toBeInTheDocument();
    });

    it('matches snapshot (authenticated)', async () => {
      const header = await NhsNotifyHeader({});

      const container = render(header);
      expect(container.asFragment()).toMatchSnapshot();
    });

    describe(`with 'routing' flag enabled`, () => {
      it('renders both the navigation links with correct hrefs', async () => {
        const header = await NhsNotifyHeader({ routingEnabled: true });

        render(header);

        screen.getByTestId('page-header');
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
        const header = await NhsNotifyHeader({ routingEnabled: false });

        render(header);

        screen.getByTestId('page-header');
        const nav = screen.getByTestId('navigation-links');
        const templatesLink = within(nav).getByRole('link', {
          name: 'Templates',
        });
        expect(templatesLink).toHaveAttribute('href', '/message-templates');
      });

      it('should not render the message plans link', async () => {
        const header = await NhsNotifyHeader({ routingEnabled: false });

        render(header);

        screen.getByTestId('page-header');
        const nav = screen.getByTestId('navigation-links');
        const plansLink = within(nav).queryByRole('link', {
          name: 'Message plans',
        });
        expect(plansLink).not.toBeInTheDocument();
      });
    });
  });
});
