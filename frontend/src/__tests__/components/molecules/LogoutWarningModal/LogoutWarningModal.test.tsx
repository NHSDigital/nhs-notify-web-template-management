import { render, fireEvent, act } from '@testing-library/react';
import { LogoutWarningModal } from '@molecules/LogoutWarningModal/LogoutWarningModal';
import { useAuthenticator, type UseAuthenticator } from '@aws-amplify/ui-react';
import { useRouter, usePathname } from 'next/navigation';
import { mockDeep } from 'jest-mock-extended';

jest.mock('next/navigation');
jest.mock('aws-amplify/auth');
jest.mock('@aws-amplify/ui-react');

const useAuthenticatorMock = jest.mocked(useAuthenticator);

const routerPushMock: jest.Mock = jest.fn();

const dialogCloseMock = jest.fn(function mock(this: HTMLDialogElement) {
  this.open = false;
});

const dialogOpenMock = jest.fn(function mock(this: HTMLDialogElement) {
  this.open = true;
});

describe('LogoutWarningModal', () => {
  beforeAll(() => {
    jest.resetAllMocks();

    // Polyfill dialog actions since JSDOM does not support it
    // https://github.com/jsdom/jsdom/issues/3294
    HTMLDialogElement.prototype.showModal = dialogOpenMock;

    HTMLDialogElement.prototype.close = dialogCloseMock;

    useAuthenticatorMock.mockImplementation((cb) => {
      const context = mockDeep<UseAuthenticator>({
        authStatus: 'authenticated',
      });

      if (cb) {
        cb(context);
      }

      return context;
    });

    (useRouter as jest.Mock).mockReturnValue({
      push: routerPushMock,
    });

    (usePathname as jest.Mock).mockReturnValue('testing');

    jest.useFakeTimers();
  });

  test('should match snapshot', async () => {
    const container = render(
      <LogoutWarningModal
        promptBeforeLogoutSeconds={120} // 2 minutes
        logoutInSeconds={900} // 15 minutes
      />
    );

    expect(container.asFragment()).toMatchSnapshot();
  });

  test('should stay closed if not authenticated', () => {
    useAuthenticatorMock.mockReturnValueOnce(
      mockDeep<UseAuthenticator>({
        authStatus: 'unauthenticated',
      })
    );

    render(
      <LogoutWarningModal
        promptBeforeLogoutSeconds={120} // 2 minutes
        logoutInSeconds={900} // 15 minutes
      />
    );

    act(() => {
      // advance timers by 15 minutes
      jest.advanceTimersByTime(60 * 15 * 1000);
      fireEvent.focus(document);
    });

    expect(routerPushMock).not.toHaveBeenCalled();

    expect(dialogOpenMock).not.toHaveBeenCalled();

    expect(dialogCloseMock).toHaveBeenCalledTimes(1);
  });

  test('should show modal after prompt timeout', async () => {
    render(
      <LogoutWarningModal
        promptBeforeLogoutSeconds={120} // 2 minutes
        logoutInSeconds={900} // 15 minutes
      />
    );

    // advance timers by 12 minutes
    jest.advanceTimersByTime(60 * 12 * 1000);

    expect(dialogOpenMock).not.toHaveBeenCalled();

    act(() => {
      // advance timers by 1 minute
      jest.advanceTimersByTime(60 * 1 * 1000);
      fireEvent.focus(document);
    });

    expect(dialogOpenMock).toHaveBeenCalledTimes(1);
  });

  test('should update modal header to reflect seconds before logout', () => {
    const { getByTestId } = render(
      <LogoutWarningModal
        promptBeforeLogoutSeconds={120} // 2 minutes
        logoutInSeconds={900} // 15 minutes
      />
    );

    act(() => {
      // advance timers by 14 minutes
      jest.advanceTimersByTime(60 * 14 * 1000);
      fireEvent.focus(document);
    });

    const events = [
      {
        timeRemaining: 25,
        advanceTimersBySeconds: 35,
      },
      {
        timeRemaining: 20,
        advanceTimersBySeconds: 5,
      },
      {
        timeRemaining: 10,
        advanceTimersBySeconds: 10,
      },
      {
        timeRemaining: 5,
        advanceTimersBySeconds: 5,
      },
    ];

    for (const { timeRemaining, advanceTimersBySeconds } of events) {
      act(() => {
        // advance timers by timeRemaining
        jest.advanceTimersByTime(advanceTimersBySeconds * 1000);
        fireEvent.focus(document);
      });

      expect(getByTestId('modal-header').innerHTML).toEqual(
        `For security reasons, you'll be signed out in ${timeRemaining} seconds.`
      );
    }
  });

  test('should close modal when user clicks "Stay signed in"', () => {
    const { getByTestId } = render(
      <LogoutWarningModal
        promptBeforeLogoutSeconds={120} // 2 minutes
        logoutInSeconds={900} // 15 minutes
      />
    );

    act(() => {
      // advance timers by 13 minutes
      jest.advanceTimersByTime(60 * 13 * 1000);
      fireEvent.focus(document);
    });

    fireEvent.click(getByTestId('modal-sign-in'));

    expect(dialogCloseMock).toHaveBeenCalledTimes(2);
  });

  test('should redirect when user clicks "Sign out"', async () => {
    const { getByTestId } = render(
      <LogoutWarningModal
        promptBeforeLogoutSeconds={120} // 2 minutes
        logoutInSeconds={900} // 15 minutes
      />
    );

    act(() => {
      // advance timers by 13 minutes
      jest.advanceTimersByTime(60 * 13 * 1000);
      fireEvent.focus(document);
    });

    const clicked = fireEvent.click(getByTestId('modal-sign-out'));

    expect(clicked).toBe(true);
  });

  test('should reset remaining time to initial value when user clicks "stay signed in"', () => {
    const { getByTestId } = render(
      <LogoutWarningModal
        promptBeforeLogoutSeconds={120} // 2 minutes
        logoutInSeconds={900} // 15 minutes
      />
    );

    act(() => {
      // advance timers by 14 minutes
      jest.advanceTimersByTime(60 * 14 * 1000);
      fireEvent.focus(document);
    });

    act(() => {
      // advance timers by 32 seconds
      jest.advanceTimersByTime(35_000);
      fireEvent.focus(document);
    });

    expect(getByTestId('modal-header').innerHTML).toEqual(
      `For security reasons, you'll be signed out in 25 seconds.`
    );

    const clicked = fireEvent.click(getByTestId('modal-sign-in'));

    expect(clicked).toBe(true);

    act(() => {
      // advance timers by 13 minutes
      jest.advanceTimersByTime(60 * 13 * 1000);
      fireEvent.focus(document);
    });

    expect(getByTestId('modal-header').innerHTML).toEqual(
      `For security reasons, you'll be signed out in 2 minutes.`
    );
  });

  test('should redirect when user does not interact after specified time', () => {
    render(
      <LogoutWarningModal
        promptBeforeLogoutSeconds={120} // 2 minutes
        logoutInSeconds={900} // 15 minutes
      />
    );

    act(() => {
      // set system time to 15 minutes into the future
      jest.setSystemTime(Date.now() + 60 * 15 * 1000);

      // advance timers by 15 minutes
      jest.advanceTimersByTime(60 * 15 * 1000);

      fireEvent.focus(document);
    });

    expect(routerPushMock).toHaveBeenCalledWith(
      '/auth/inactive?redirect=%2Ftemplates%2Ftesting'
    );

    expect(dialogCloseMock).toHaveBeenCalledTimes(1);
  });
});
