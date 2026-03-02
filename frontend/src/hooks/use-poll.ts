import { useEffect, useRef, useState } from 'react';

export type UsePollOptions<T> = {
  fetchFn: (signal: AbortSignal) => Promise<T | null>;
  /**
   * When omitted, polling starts immediately and `shouldPoll` is not called
   * for the initial value
   */
  initialValue?: T;
  shouldPoll: (value: T) => boolean;
  onUpdate: (value: T) => void;
  /**
   * Called when `fetchFn` throws. Return `true` to stop polling immediately.
   * Return `false` or `undefined` to continue polling
   */
  onError?: (error: unknown) => boolean | void;
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

  // Wrap all callbacks in refs so the polling effect dependency array is stable
  const shouldPollRef = useRef(shouldPoll);
  const onUpdateRef = useRef(onUpdate);
  const onErrorRef = useRef(onError);
  const fetchFnRef = useRef(fetchFn);
  // keep referenced callbacks up to date
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
        if (abortController.signal.aborted) return;

        if (onErrorRef.current?.(error) === true) {
          setIsPolling(false);
        }
      } finally {
        inFlight = false;
      }
    };

    void poll();

    const pollTimerId = setInterval(() => {
      void poll();
    }, intervalMs);

    let timeoutTimerId: NodeJS.Timeout | undefined;

    if (timeoutMs !== undefined) {
      timeoutTimerId = setTimeout(() => {
        setIsPolling(false);
        setIsTimedOut(true);
      }, timeoutMs);
    }

    return () => {
      abortController.abort();
      clearInterval(pollTimerId);
      if (timeoutTimerId !== undefined) clearTimeout(timeoutTimerId);
    };
  }, [isPolling, intervalMs, timeoutMs]);

  return { isPolling, isTimedOut };
}
