import { ReactNode, ComponentType } from 'react';
import MockSignoutPage from '@app/auth/signout/page.dev';
import { render, screen } from '@testing-library/react';

jest.mock('@aws-amplify/auth', () => ({
  signOut: () => Promise.resolve(),
}));

jest.mock('@molecules/Redirect/Redirect', () => ({
  Redirect: () => <p>redirect</p>,
}));

jest.mock('@aws-amplify/ui-react', () => ({
  Authenticator: {
    Provider: ({ children }: { children: ReactNode }) => children,
  },
  withAuthenticator: (Component: ComponentType) => Component,
}));

test('MockSignoutPage', async () => {
  const container = render(<MockSignoutPage />);

  await screen.findByText('redirect');

  expect(container.asFragment()).toMatchSnapshot();
});
