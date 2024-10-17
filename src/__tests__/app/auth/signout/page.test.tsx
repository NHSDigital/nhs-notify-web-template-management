import { ReactNode, ComponentType } from 'react';
import SignoutPage from '@app/auth/signout/page';
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

test('SignoutPage', async () => {
  const container = render(<SignoutPage />);

  await screen.findByText('redirect');

  expect(container.asFragment()).toMatchSnapshot();
});
