import { render } from '@testing-library/react';
import { Amplify } from 'aws-amplify';

jest.mock('aws-amplify', () => ({
  Amplify: {
    configure: jest.fn(),
  },
}));

describe('AuthProvider', () => {
  it('configures Amplify with the amplify config and ssr enabled', async () => {
    await import('@providers/auth-provider');

    expect(Amplify.configure).toHaveBeenCalledWith({}, { ssr: true });
  });

  it('renders children within Authenticator.Provider', async () => {
    const { AuthProvider } = await import('@providers/auth-provider');

    const { container } = render(
      <AuthProvider>
        <p>child content</p>
      </AuthProvider>
    );

    expect(container).toMatchSnapshot();
  });
});
