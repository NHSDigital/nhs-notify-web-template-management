import { useEffect, useRef, useState } from 'react';

export type UsePollOptions<T> = {
  fetchFn: (signal: AbortSignal) => Promise<T | null>;
  /**
   * When omitted, polling starts immediately and `shouldPoll` is not called
   * for the initial value (it is assumed polling is needed).
   */
  initialValue?: T;
  shouldPoll: (value: T) => boolean;
  /**
   * Called with the final value when `shouldPoll` returns false.
   * Not called when polling stops due to `timeoutMs` expiring.
   */
  onUpdate: (value: T) => void;
  /**
   * Called when `fetchFn` throws. Abort errors (thrown when the component
   * unmounts) are filtered out and never forwarded. Polling continues after
   * each error; the timeout (if set) will eventually stop it.
   */
  onError?: (error: unknown) => void;
  intervalMs: number;
  /** Omit for no timeout (poll indefinitely until shouldPoll returns false). */
  timeoutMs?: number;
};

export type UsePollResult = {
  isPolling: boolean;
  isTimedOut: boolean;
};

export function usePoll<T>({
  fetchFn,
  initialValue,
  shouldPoll,
  onUpdate,
  onError,
  intervalMs,
  timeoutMs,
}: UsePollOptions<T>): UsePollResult {
  const [isPolling, setIsPolling] = useState(
    () => initialValue === undefined || shouldPoll(initialValue)
  );
  const [isTimedOut, setIsTimedOut] = useState(false);

  // Keep callbacks in refs so the polling effect dep array stays stable.
  // Assigned unconditionally during render (safe — refs are mutable and do
  // not trigger re-renders), avoiding the stale-ref window that would exist
  // if they were synced inside a separate effect.
  const shouldPollRef = useRef(shouldPoll);
  const onUpdateRef = useRef(onUpdate);
  const onErrorRef = useRef(onError);
  const fetchFnRef = useRef(fetchFn);
  shouldPollRef.current = shouldPoll;
  onUpdateRef.current = onUpdate;
  onErrorRef.current = onError;
  fetchFnRef.current = fetchFn;

  useEffect(() => {
    if (!isPolling) return;

    const abortController = new AbortController();
    let inFlight = false;

    const poll = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const value = await fetchFnRef.current(abortController.signal);

        if (abortController.signal.aborted) return;

        if (!value) return;

        if (!shouldPollRef.current(value)) {
          setIsPolling(false);
          onUpdateRef.current(value);
          return;
        }
      } catch (error) {
        // Abort errors are expected on unmount — don't forward them.
        if (abortController.signal.aborted) return;
        onErrorRef.current?.(error);
      } finally {
        inFlight = false;
      }
    };

    void poll();

    const pollTimerId = setInterval(() => {
      void poll();
    }, intervalMs);

    const timeoutTimerId =
      timeoutMs === undefined
        ? undefined
        : setTimeout(() => {
            setIsPolling(false);
            setIsTimedOut(true);
          }, timeoutMs);

    return () => {
      abortController.abort();
      clearInterval(pollTimerId);
      if (timeoutTimerId !== undefined) clearTimeout(timeoutTimerId);
    };
  }, [isPolling, intervalMs, timeoutMs]);

  return { isPolling, isTimedOut };
}
