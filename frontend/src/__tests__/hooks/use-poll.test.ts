import { renderHook, act, waitFor } from '@testing-library/react';
import { usePoll } from '@hooks/use-poll';

type PollValue = { id: string; status: 'PENDING' | 'DONE' };

const PENDING: PollValue = { id: 'item-1', status: 'PENDING' };
const DONE: PollValue = { id: 'item-1', status: 'DONE' };

const shouldPoll = (v: PollValue) => v.status === 'PENDING';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

// #9: default timeoutMs is undefined so infinite-polling tests can use
// createOptions() directly; tests that need a timeout pass it explicitly.
function createOptions(
  overrides: Partial<Parameters<typeof usePoll<PollValue>>[0]> = {}
) {
  return {
    fetchFn: jest.fn<Promise<PollValue | null>, [AbortSignal]>().mockResolvedValue(PENDING),
    initialValue: PENDING,
    shouldPoll,
    onUpdate: jest.fn(),
    intervalMs: 1500,
    ...overrides,
  };
}

describe('usePoll', () => {
  it('starts in polling state when shouldPoll(initialValue) is true', () => {
    const { result } = renderHook(() => usePoll(createOptions()));

    expect(result.current.isPolling).toBe(true);
    expect(result.current.isTimedOut).toBe(false);
  });

  it('starts in polling state when initialValue is omitted', () => {
    const { result } = renderHook(() =>
      usePoll(
        createOptions({ initialValue: undefined })
      )
    );

    expect(result.current.isPolling).toBe(true);
    expect(result.current.isTimedOut).toBe(false);
  });

  // #8: shouldPoll must not be called during initial state derivation when
  // initialValue is undefined (shouldPoll only handles T, not T | undefined).
  it('does not call shouldPoll during init when initialValue is omitted', () => {
    const shouldPollSpy = jest.fn(shouldPoll);

    renderHook(() =>
      usePoll(createOptions({ initialValue: undefined, shouldPoll: shouldPollSpy }))
    );

    // shouldPoll should only be called when a fetch result arrives, not on init
    expect(shouldPollSpy).not.toHaveBeenCalled();
  });

  it('does not poll when shouldPoll returns false for initialValue', async () => {
    const fetchFn = jest.fn<Promise<PollValue | null>, [AbortSignal]>();
    const onUpdate = jest.fn();

    const { result } = renderHook(() =>
      usePoll(createOptions({ initialValue: DONE, fetchFn, onUpdate }))
    );

    await act(() => Promise.resolve());

    expect(result.current.isPolling).toBe(false);
    expect(result.current.isTimedOut).toBe(false);
    expect(fetchFn).not.toHaveBeenCalled();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('calls fetchFn immediately on mount', async () => {
    const fetchFn = jest.fn<Promise<PollValue | null>, [AbortSignal]>().mockResolvedValue(PENDING);

    renderHook(() => usePoll(createOptions({ fetchFn })));

    await act(() => Promise.resolve());

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(fetchFn).toHaveBeenCalledWith(expect.any(AbortSignal));
  });

  it('polls on the configured interval', async () => {
    const fetchFn = jest.fn<Promise<PollValue | null>, [AbortSignal]>().mockResolvedValue(PENDING);

    renderHook(() => usePoll(createOptions({ fetchFn, intervalMs: 2000 })));

    await act(() => Promise.resolve());
    expect(fetchFn).toHaveBeenCalledTimes(1);

    await act(async () => { jest.advanceTimersByTime(2000); });
    expect(fetchFn).toHaveBeenCalledTimes(2);

    await act(async () => { jest.advanceTimersByTime(2000); });
    expect(fetchFn).toHaveBeenCalledTimes(3);
  });

  it('stops polling and calls onUpdate when shouldPoll returns false', async () => {
    const onUpdate = jest.fn();
    const fetchFn = jest.fn<Promise<PollValue | null>, [AbortSignal]>()
      .mockResolvedValueOnce(PENDING)
      .mockResolvedValueOnce(DONE);

    const { result } = renderHook(() =>
      usePoll(createOptions({ fetchFn, onUpdate, intervalMs: 1000 }))
    );

    await act(() => Promise.resolve());
    expect(result.current.isPolling).toBe(true);
    expect(onUpdate).not.toHaveBeenCalled();

    await act(async () => { jest.advanceTimersByTime(1000); });

    await waitFor(() => {
      expect(result.current.isPolling).toBe(false);
    });

    expect(result.current.isTimedOut).toBe(false);
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith(DONE);
  });

  it('times out and sets isTimedOut after timeoutMs', async () => {
    const onUpdate = jest.fn();

    const { result } = renderHook(() =>
      usePoll(createOptions({ onUpdate, timeoutMs: 5000 }))
    );

    await act(() => Promise.resolve());
    expect(result.current.isPolling).toBe(true);

    await act(async () => { jest.advanceTimersByTime(5000); });

    expect(result.current.isPolling).toBe(false);
    expect(result.current.isTimedOut).toBe(true);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('does not poll again after timeout', async () => {
    const fetchFn = jest.fn<Promise<PollValue | null>, [AbortSignal]>().mockResolvedValue(PENDING);

    renderHook(() =>
      usePoll(createOptions({ fetchFn, timeoutMs: 3000, intervalMs: 1000 }))
    );

    await act(() => Promise.resolve());
    expect(fetchFn).toHaveBeenCalledTimes(1);

    await act(async () => { jest.advanceTimersByTime(3000); });
    const callCountAtTimeout = fetchFn.mock.calls.length;

    await act(async () => { jest.advanceTimersByTime(5000); });
    expect(fetchFn).toHaveBeenCalledTimes(callCountAtTimeout);
  });

  it('continues polling when fetchFn returns null', async () => {
    const fetchFn = jest.fn<Promise<PollValue | null>, [AbortSignal]>().mockResolvedValue(null);

    const { result } = renderHook(() =>
      usePoll(createOptions({ fetchFn, intervalMs: 1000 }))
    );

    await act(() => Promise.resolve());
    expect(result.current.isPolling).toBe(true);

    await act(async () => { jest.advanceTimersByTime(1000); });

    expect(result.current.isPolling).toBe(true);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('continues polling and calls onError when fetchFn throws a network error', async () => {
    const networkError = new TypeError('Failed to fetch');
    const fetchFn = jest.fn<Promise<PollValue | null>, [AbortSignal]>()
      .mockRejectedValue(networkError);
    const onError = jest.fn();

    const { result } = renderHook(() =>
      usePoll(createOptions({ fetchFn, onError, intervalMs: 1000 }))
    );

    await act(() => Promise.resolve());
    expect(result.current.isPolling).toBe(true);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(networkError);

    await act(async () => { jest.advanceTimersByTime(1000); });

    expect(result.current.isPolling).toBe(true);
    expect(onError).toHaveBeenCalledTimes(2);
  });

  it('does not call onError when fetchFn throws due to abort', async () => {
    const onError = jest.fn();

    // Simulate fetch throwing an AbortError (as the browser fetch API does)
    // while the signal is already aborted, so the abort guard in the catch fires.
    const fetchFn = jest.fn<Promise<PollValue | null>, [AbortSignal]>().mockImplementation(
      (signal) =>
        new Promise<PollValue | null>((_, reject) => {
          // Reject with an abort error once the signal fires
          signal.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted.', 'AbortError'));
          });
        })
    );

    const { unmount } = renderHook(() =>
      usePoll(createOptions({ fetchFn, onError }))
    );

    // Fetch is in-flight; unmount triggers abort, which causes fetchFn to throw
    unmount();

    await act(() => Promise.resolve());

    expect(onError).not.toHaveBeenCalled();
  });

  it('does not throw when onError is omitted and fetchFn throws', async () => {
    const fetchFn = jest.fn<Promise<PollValue | null>, [AbortSignal]>()
      .mockRejectedValue(new TypeError('Failed to fetch'));

    const { result } = renderHook(() =>
      usePoll(createOptions({ fetchFn }))
    );

    // Should not throw
    await act(() => Promise.resolve());

    expect(result.current.isPolling).toBe(true);
  });

  it('aborts in-flight requests on unmount', async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, 'abort');

    const { unmount } = renderHook(() => usePoll(createOptions()));

    await act(() => Promise.resolve());

    unmount();

    expect(abortSpy).toHaveBeenCalled();
  });

  it('clears interval timer on unmount', async () => {
    const clearIntervalSpy = jest.spyOn(globalThis, 'clearInterval');

    const { unmount } = renderHook(() => usePoll(createOptions()));

    await act(() => Promise.resolve());

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('clears timeout timer on unmount when timeoutMs is set', async () => {
    const clearTimeoutSpy = jest.spyOn(globalThis, 'clearTimeout');

    const { unmount } = renderHook(() => usePoll(createOptions({ timeoutMs: 20_000 })));

    await act(() => Promise.resolve());

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('does not call clearTimeout on unmount when timeoutMs is omitted', async () => {
    const clearTimeoutSpy = jest.spyOn(globalThis, 'clearTimeout');

    const { unmount } = renderHook(() => usePoll(createOptions()));

    await act(() => Promise.resolve());

    unmount();

    expect(clearTimeoutSpy).not.toHaveBeenCalled();
  });

  it('polls indefinitely when timeoutMs is omitted', async () => {
    const fetchFn = jest.fn<Promise<PollValue | null>, [AbortSignal]>().mockResolvedValue(PENDING);

    const { result } = renderHook(() =>
      usePoll(createOptions({ fetchFn, intervalMs: 1000 }))
    );

    await act(() => Promise.resolve());
    expect(result.current.isPolling).toBe(true);

    // Advance well past any typical timeout — still polling, never timed out
    await act(async () => { jest.advanceTimersByTime(300_000); });

    expect(result.current.isPolling).toBe(true);
    expect(result.current.isTimedOut).toBe(false);
  });

  it('ignores fetch response when signal is already aborted', async () => {
    const onUpdate = jest.fn();
    let resolveDelayedFetch!: (value: PollValue | null) => void;

    const fetchFn = jest.fn<Promise<PollValue | null>, [AbortSignal]>()
      .mockResolvedValueOnce(PENDING)
      .mockImplementationOnce(
        () =>
          new Promise<PollValue | null>((resolve) => {
            resolveDelayedFetch = resolve;
          })
      );

    const { unmount } = renderHook(() =>
      usePoll(createOptions({ fetchFn, onUpdate, intervalMs: 1000 }))
    );

    await act(() => Promise.resolve());
    expect(onUpdate).not.toHaveBeenCalled();

    await act(async () => { jest.advanceTimersByTime(1000); });

    unmount();

    await act(async () => {
      resolveDelayedFetch(DONE);
    });

    expect(onUpdate).not.toHaveBeenCalled();
  });

  // #6: while one fetch is in-flight, a subsequent interval tick must not
  // start a second concurrent fetch. onUpdate must only be called once even
  // if the interval fires before the first fetch resolves.
  it('does not start a new poll while one is in-flight', async () => {
    const onUpdate = jest.fn();
    let resolveFirstFetch!: (value: PollValue | null) => void;

    const fetchFn = jest.fn<Promise<PollValue | null>, [AbortSignal]>()
      .mockImplementationOnce(
        () =>
          new Promise<PollValue | null>((resolve) => {
            resolveFirstFetch = resolve;
          })
      )
      .mockResolvedValue(DONE);

    renderHook(() =>
      usePoll(createOptions({ fetchFn, onUpdate, intervalMs: 1000 }))
    );

    // First poll is in-flight (not yet resolved)
    expect(fetchFn).toHaveBeenCalledTimes(1);

    // Interval fires before first fetch resolves
    await act(async () => { jest.advanceTimersByTime(1000); });

    // Guard must prevent a second fetch starting
    expect(fetchFn).toHaveBeenCalledTimes(1);

    // Now resolve the first fetch with a terminal value
    await act(async () => {
      resolveFirstFetch(DONE);
    });

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith(DONE);
  });

  // #7: a fetch that resolves after the timeout fires must not call onUpdate.
  it('does not call onUpdate when fetch resolves after timeout', async () => {
    const onUpdate = jest.fn();
    let resolveDelayedFetch!: (value: PollValue | null) => void;

    const fetchFn = jest.fn<Promise<PollValue | null>, [AbortSignal]>().mockImplementation(
      () =>
        new Promise<PollValue | null>((resolve) => {
          resolveDelayedFetch = resolve;
        })
    );

    const { result } = renderHook(() =>
      usePoll(createOptions({ fetchFn, onUpdate, timeoutMs: 2000, intervalMs: 5000 }))
    );

    // Fetch is in-flight
    expect(fetchFn).toHaveBeenCalledTimes(1);

    // Timeout fires before the fetch resolves
    await act(async () => { jest.advanceTimersByTime(2000); });

    expect(result.current.isPolling).toBe(false);
    expect(result.current.isTimedOut).toBe(true);

    // Fetch finally resolves with a terminal value — abort signal is set
    await act(async () => {
      resolveDelayedFetch(DONE);
    });

    expect(onUpdate).not.toHaveBeenCalled();
  });
});
