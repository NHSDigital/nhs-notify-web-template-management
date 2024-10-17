import { render, waitFor } from '@testing-library/react';
import { ClientLayout } from '@molecules/ClientLayout/ClientLayout';

jest.mock('@aws-amplify/ui-react', () => ({
  ...jest.requireActual('@aws-amplify/ui-react'),
  useAuthenticator: () => ({
    authStatus: 'authenticated',
  }),
}));

test('ClientLayout', async () => {
  const container = render(
    <ClientLayout>
      <p>testing</p>
    </ClientLayout>
  );

  await waitFor(() => {});
  expect(container.asFragment()).toMatchSnapshot();
});
