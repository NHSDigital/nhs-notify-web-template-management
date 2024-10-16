import { ReactNode, ComponentType } from 'react';
import AuthPage from '@app/auth/page';
import { render } from '@testing-library/react';

jest.mock('@aws-amplify/ui-react', () => ({
  Authenticator: {
    Provider: ({ children }: { children: ReactNode }) => children,
  },
  withAuthenticator: (Component: ComponentType) => Component,
}));
jest.mock('@molecules/Redirect/Redirect', () => ({
  Redirect: () => <p>redirect</p>,
}));

test('AuthPage', () => {
  const container = render(<AuthPage />);

  expect(container.asFragment()).toMatchSnapshot();
});
