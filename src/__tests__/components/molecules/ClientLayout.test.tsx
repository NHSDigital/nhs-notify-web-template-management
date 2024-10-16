import { render, waitFor } from '@testing-library/react';
import { ClientLayout } from '@molecules/ClientLayout/ClientLayout';

test('ClientLayout', async () => {
  const container = render(
    <ClientLayout>
      <p>testing</p>
    </ClientLayout>
  );

  await waitFor(() => {});
  expect(container.asFragment()).toMatchSnapshot();
});
