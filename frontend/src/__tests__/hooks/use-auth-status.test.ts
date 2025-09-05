import { renderHook } from '@testing-library/react';
import type { AuthStatus } from '@aws-amplify/ui';
import { UseAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { useAuthStatus } from '../../hooks/use-auth-status';
import { mockDeep } from 'jest-mock-extended';

jest.mock('@aws-amplify/ui-react');

function createAmplifyAuthStatusController(initial: AuthStatus) {
  let current: AuthStatus = initial;

  jest.mocked(useAuthenticator).mockImplementation((selector) => {
    const context = mockDeep<UseAuthenticator>({
      authStatus: current,
    });

    if (selector) {
      selector(context);
    }

    return context;
  });

  return {
    setStatus: (next: AuthStatus) => {
      current = next;
    },
  };
}

describe('useAuthStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('immediately uses Amplify status when already settled (authenticated)', () => {
    createAmplifyAuthStatusController('authenticated');

    const { result } = renderHook(() => useAuthStatus('unauthenticated'));

    expect(result.current).toBe('authenticated');
  });

  it('immediately uses Amplify status when already settled (unauthenticated)', () => {
    createAmplifyAuthStatusController('unauthenticated');

    const { result } = renderHook(() => useAuthStatus('authenticated'));
    expect(result.current).toBe('unauthenticated');
  });

  it('uses provided initial while Amplify is configuring, then updates when settled', () => {
    const ctl = createAmplifyAuthStatusController('configuring');

    const { result, rerender } = renderHook(() =>
      useAuthStatus('unauthenticated')
    );

    expect(result.current).toBe('unauthenticated');

    ctl.setStatus('authenticated');

    rerender();

    expect(result.current).toBe('authenticated');
  });

  it('does not change while Amplify stays configuring across re-renders', () => {
    createAmplifyAuthStatusController('configuring');

    const { result, rerender } = renderHook(() =>
      useAuthStatus('unauthenticated')
    );
    expect(result.current).toBe('unauthenticated');

    rerender();
    expect(result.current).toBe('unauthenticated');

    rerender();
    expect(result.current).toBe('unauthenticated');
  });

  it('initialStatus defaults to "configuring" and updates when settled', () => {
    const ctl = createAmplifyAuthStatusController('configuring');

    const { result, rerender } = renderHook(() => useAuthStatus());

    expect(result.current).toBe('configuring');

    ctl.setStatus('unauthenticated');
    rerender();

    expect(result.current).toBe('unauthenticated');
  });
});
