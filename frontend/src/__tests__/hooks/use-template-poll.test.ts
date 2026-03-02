import { renderHook, act, waitFor } from '@testing-library/react';
import { useTemplatePoll } from '@hooks/use-template-poll';
import type { TemplateDto } from 'nhs-notify-web-template-management-types';

const TEMPLATE_ID = 'template-123';

const pendingTemplate = {
  id: TEMPLATE_ID,
  templateType: 'LETTER',
  templateStatus: 'PENDING_VALIDATION',
} as TemplateDto;

const renderedTemplate = {
  id: TEMPLATE_ID,
  templateType: 'LETTER',
  templateStatus: 'NOT_YET_SUBMITTED',
} as TemplateDto;

jest.mock('@utils/get-base-path', () => ({
  getBasePath: () => '/templates',
}));

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(pendingTemplate), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  );
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

function createOptions(
  overrides: Partial<Parameters<typeof useTemplatePoll>[0]> = {}
) {
  return {
    templateId: TEMPLATE_ID,
    shouldPoll: (t: TemplateDto) => t.templateStatus === 'PENDING_VALIDATION',
    onUpdate: jest.fn(),
    intervalMs: 1500,
    timeoutMs: 20_000,
    ...overrides,
  };
}

describe('useTemplatePoll', () => {
  it('starts in polling state', () => {
    const { result } = renderHook(() => useTemplatePoll(createOptions()));

    expect(result.current.isPolling).toBe(true);
    expect(result.current.isTimedOut).toBe(false);
  });

  it('does not poll when enabled is false', async () => {
    const onUpdate = jest.fn();

    const { result } = renderHook(() =>
      useTemplatePoll(createOptions({ enabled: false, onUpdate }))
    );

    await act(() => Promise.resolve());

    expect(result.current.isPolling).toBe(false);
    expect(result.current.isTimedOut).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('fetches the template immediately on mount', async () => {
    renderHook(() => useTemplatePoll(createOptions()));

    await act(() => Promise.resolve());

    expect(fetch).toHaveBeenCalledWith(
      `/templates/preview-letter-template/${TEMPLATE_ID}/poll`,
      expect.objectContaining({ cache: 'no-store' })
    );
  });

  it('polls on the configured interval', async () => {
    renderHook(() => useTemplatePoll(createOptions({ intervalMs: 2000 })));

    // Initial fetch
    await act(() => Promise.resolve());
    expect(fetch).toHaveBeenCalledTimes(1);

    // Advance to first interval
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(fetch).toHaveBeenCalledTimes(2);

    // Advance to second interval
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('stops polling and calls onUpdate when shouldPoll returns false', async () => {
    const onUpdate = jest.fn();

    jest
      .mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify(pendingTemplate), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(renderedTemplate), { status: 200 })
      );

    const { result } = renderHook(() =>
      useTemplatePoll(createOptions({ onUpdate, intervalMs: 1000 }))
    );

    // Initial fetch - still pending
    await act(() => Promise.resolve());
    expect(result.current.isPolling).toBe(true);
    expect(onUpdate).not.toHaveBeenCalled();

    // Second fetch - now rendered
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(result.current.isPolling).toBe(false);
    });

    expect(result.current.isTimedOut).toBe(false);
    expect(onUpdate).toHaveBeenCalledWith(renderedTemplate);
  });

  it('times out and sets isTimedOut after timeoutMs', async () => {
    const onUpdate = jest.fn();

    const { result } = renderHook(() =>
      useTemplatePoll(createOptions({ onUpdate, timeoutMs: 5000 }))
    );

    await act(() => Promise.resolve());
    expect(result.current.isPolling).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.isPolling).toBe(false);
    expect(result.current.isTimedOut).toBe(true);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('does not poll again after timeout', async () => {
    renderHook(() =>
      useTemplatePoll(createOptions({ timeoutMs: 3000, intervalMs: 1000 }))
    );

    await act(() => Promise.resolve());
    expect(fetch).toHaveBeenCalledTimes(1);

    // Advance past timeout
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    const callCountAtTimeout = jest.mocked(fetch).mock.calls.length;

    // Advance further - no more fetches
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(fetch).toHaveBeenCalledTimes(callCountAtTimeout);
  });

  it('continues polling when fetch returns a non-ok response', async () => {
    jest.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));

    const { result } = renderHook(() =>
      useTemplatePoll(createOptions({ intervalMs: 1000 }))
    );

    await act(() => Promise.resolve());
    expect(result.current.isPolling).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.isPolling).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('continues polling when fetch throws a network error', async () => {
    jest.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));

    const { result } = renderHook(() =>
      useTemplatePoll(createOptions({ intervalMs: 1000 }))
    );

    await act(() => Promise.resolve());
    expect(result.current.isPolling).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.isPolling).toBe(true);
  });

  it('aborts in-flight requests on unmount', async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, 'abort');

    const { unmount } = renderHook(() => useTemplatePoll(createOptions()));

    await act(() => Promise.resolve());

    unmount();

    expect(abortSpy).toHaveBeenCalled();
  });

  it('uses default enabled, intervalMs, and timeoutMs values', async () => {
    const onUpdate = jest.fn();

    const { result } = renderHook(() =>
      useTemplatePoll({
        templateId: TEMPLATE_ID,
        shouldPoll: (t: TemplateDto) =>
          t.templateStatus === 'PENDING_VALIDATION',
        onUpdate,
      })
    );

    // enabled defaults to true, so polling should start
    expect(result.current.isPolling).toBe(true);

    await act(() => Promise.resolve());

    // Should have fetched using default interval
    expect(fetch).toHaveBeenCalledTimes(1);

    // Default interval is 1500ms
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });
    expect(fetch).toHaveBeenCalledTimes(2);

    // Default timeout is 20000ms — advance to timeout
    await act(async () => {
      jest.advanceTimersByTime(20_000);
    });
    expect(result.current.isTimedOut).toBe(true);
  });

  it('clears timers on unmount', async () => {
    const clearIntervalSpy = jest.spyOn(globalThis, 'clearInterval');
    const clearTimeoutSpy = jest.spyOn(globalThis, 'clearTimeout');

    const { unmount } = renderHook(() => useTemplatePoll(createOptions()));

    await act(() => Promise.resolve());

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('ignores fetch response when signal is already aborted', async () => {
    const onUpdate = jest.fn();
    let resolveDelayedFetch!: (value: Response) => void;

    // First fetch returns pending (shouldPoll=true, so no onUpdate call).
    // Second fetch will be delayed — resolved after unmount.
    jest
      .mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify(pendingTemplate), { status: 200 })
      )
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveDelayedFetch = resolve;
          })
      );

    const { unmount } = renderHook(() =>
      useTemplatePoll(createOptions({ onUpdate, intervalMs: 1000 }))
    );

    // Initial fetch — still pending, shouldPoll returns true
    await act(() => Promise.resolve());
    expect(onUpdate).not.toHaveBeenCalled();

    // Trigger interval poll — this starts the delayed fetch
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    // Unmount while the second fetch is still in-flight — this aborts the signal
    unmount();

    // Now resolve the delayed fetch after unmount with a rendered template
    // (shouldPoll would return false, triggering onUpdate — but signal is aborted)
    await act(async () => {
      resolveDelayedFetch(
        new Response(JSON.stringify(renderedTemplate), { status: 200 })
      );
    });

    // onUpdate should NOT have been called because the signal was aborted
    expect(onUpdate).not.toHaveBeenCalled();
  });
});
