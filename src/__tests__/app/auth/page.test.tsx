import { ReactNode, ComponentType } from 'react';
import MockAuthPage from '@app/auth/page.dev';
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

test('MockAuthPage', () => {
  const container = render(<MockAuthPage />);

  expect(container.asFragment()).toMatchSnapshot();
});
