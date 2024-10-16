import { render, waitFor } from '@testing-library/react';
import { NHSNotifyHeader } from '@molecules/Header/Header';
import { Authenticator } from '@aws-amplify/ui-react';
import { usePathname } from 'next/navigation';

jest.mock('next/navigation');

describe('Header component', () => {
  it('auth path', async () => {
    jest.mocked(usePathname).mockReturnValue('/auth');

    const container = render(
      <Authenticator.Provider>
        <NHSNotifyHeader />
      </Authenticator.Provider>
    );

    await waitFor(() => {});
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('non-auth path', async () => {
    jest.mocked(usePathname).mockReturnValue('/templates');

    const container = render(
      <Authenticator.Provider>
        <NHSNotifyHeader />
      </Authenticator.Provider>
    );

    await waitFor(() => {});
    expect(container.asFragment()).toMatchSnapshot();
  });
});
