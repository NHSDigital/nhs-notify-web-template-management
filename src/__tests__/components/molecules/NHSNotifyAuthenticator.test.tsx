import { mockDeep } from 'jest-mock-extended';
import { NHSNotifyAuthenticator } from '@molecules/NHSNotifyAuthenticator/NHSNotifyAuthenticator';
import { usePathname, redirect } from 'next/navigation';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { render, waitFor } from '@testing-library/react';

jest.mock('next/navigation');
jest.mock('@aws-amplify/ui-react', () => ({
  ...jest.requireActual('@aws-amplify/ui-react'),
  useAuthenticator: jest.fn(),
}));

test('NHSNotifyAuthenticator - authenticated', async () => {
  jest.mocked(useAuthenticator).mockReturnValue(
    mockDeep<ReturnType<typeof useAuthenticator>>({
      authStatus: 'authenticated',
    })
  );

  const container = render(
    <NHSNotifyAuthenticator>
      <p>testing</p>
    </NHSNotifyAuthenticator>
  );
  await waitFor(() => container.getByText('testing'));
  expect(container.asFragment()).toMatchSnapshot();
});

test('NHSNotifyAuthenticator - unauthenticated', async () => {
  jest.mocked(useAuthenticator).mockReturnValue(
    mockDeep<ReturnType<typeof useAuthenticator>>({
      authStatus: 'unauthenticated',
    })
  );
  jest.mocked(usePathname).mockReturnValue('/redirect');
  const redirectMock = jest.mocked(redirect);

  render(
    <NHSNotifyAuthenticator>
      <p>testing</p>
    </NHSNotifyAuthenticator>
  );
  await waitFor(() => {});
  expect(redirectMock).toHaveBeenCalledWith('/auth?redirect=%2Fredirect');
});

test('NHSNotifyAuthenticator - configuring', async () => {
  jest.mocked(useAuthenticator).mockReturnValue(
    mockDeep<ReturnType<typeof useAuthenticator>>({
      authStatus: 'configuring',
    })
  );

  const container = render(
    <NHSNotifyAuthenticator>
      <p>testing</p>
    </NHSNotifyAuthenticator>
  );
  await waitFor(() => {});
  expect(container.asFragment()).toMatchSnapshot();
});
