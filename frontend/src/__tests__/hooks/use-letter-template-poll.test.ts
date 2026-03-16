import { renderHook, act } from '@testing-library/react';
import {
  useLetterTemplatePoll,
  RENDER_TIMEOUT_MS,
  POLL_INTERVAL_MS,
} from '@hooks/use-letter-template-poll';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';

const mockRefresh = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

const pendingTemplate: AuthoringLetterTemplate = {
  id: 'template-abc',
  clientId: 'client-id',
  name: 'Test Letter',
  templateType: 'LETTER',
  templateStatus: 'NOT_YET_SUBMITTED',
  letterType: 'x0',
  language: 'en',
  letterVersion: 'AUTHORING',
  files: {
    docxTemplate: {
      currentVersion: 'v1',
      fileName: 'template.docx',
      virusScanStatus: 'PASSED',
    },
    initialRender: {
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
    },
  },
  systemPersonalisation: [],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  lockNumber: 1,
};

const renderedTemplate: AuthoringLetterTemplate = {
  ...pendingTemplate,
  files: {
    ...pendingTemplate.files,
    initialRender: {
      status: 'RENDERED',
      fileName: 'render.pdf',
      currentVersion: 'v1',
      pageCount: 1,
    },
  },
};

beforeEach(() => {
  jest.useFakeTimers();
  mockRefresh.mockClear();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useLetterTemplatePoll', () => {
  it('starts polling when shouldPoll returns true for the initial template', () => {
    const { result } = renderHook(() =>
      useLetterTemplatePoll({
        template: pendingTemplate,
        shouldPoll: (t) => t.files.initialRender.status === 'PENDING',
      })
    );

    expect(result.current.isPolling).toBe(true);
  });

  it('does not start polling when shouldPoll returns false for the initial template', () => {
    const { result } = renderHook(() =>
      useLetterTemplatePoll({
        template: renderedTemplate,
        shouldPoll: (t) => t.files.initialRender.status === 'PENDING',
      })
    );

    expect(result.current.isPolling).toBe(false);
  });

  it('calls router.refresh on each poll interval', () => {
    renderHook(() =>
      useLetterTemplatePoll({
        template: pendingTemplate,
        shouldPoll: () => true,
      })
    );

    expect(mockRefresh).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(POLL_INTERVAL_MS);
    });

    expect(mockRefresh).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(POLL_INTERVAL_MS);
    });

    expect(mockRefresh).toHaveBeenCalledTimes(2);
  });

  it('stops polling when RENDER_TIMEOUT_MS elapses', () => {
    const { result } = renderHook(() =>
      useLetterTemplatePoll({
        template: pendingTemplate,
        shouldPoll: () => true,
      })
    );

    act(() => {
      jest.advanceTimersByTime(RENDER_TIMEOUT_MS);
    });

    expect(result.current.isPolling).toBe(false);
  });

  it('stops polling when the template prop updates with shouldPoll returning false', () => {
    const { result, rerender } = renderHook(
      ({ template }: { template: AuthoringLetterTemplate }) =>
        useLetterTemplatePoll({
          template,
          shouldPoll: (t) => t.files.initialRender.status === 'PENDING',
        }),
      { initialProps: { template: pendingTemplate } }
    );

    expect(result.current.isPolling).toBe(true);

    act(() => {
      rerender({ template: renderedTemplate });
    });

    expect(result.current.isPolling).toBe(false);
  });

  it('stops calling router.refresh after polling stops', () => {
    const { rerender } = renderHook(
      ({ template }: { template: AuthoringLetterTemplate }) =>
        useLetterTemplatePoll({
          template,
          shouldPoll: (t) => t.files.initialRender.status === 'PENDING',
        }),
      { initialProps: { template: pendingTemplate } }
    );

    act(() => {
      jest.advanceTimersByTime(POLL_INTERVAL_MS);
    });

    expect(mockRefresh).toHaveBeenCalledTimes(1);

    act(() => {
      rerender({ template: renderedTemplate });
    });

    act(() => {
      jest.advanceTimersByTime(POLL_INTERVAL_MS * 3);
    });

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('does not call router.refresh after timeout', () => {
    renderHook(() =>
      useLetterTemplatePoll({
        template: pendingTemplate,
        shouldPoll: () => true,
      })
    );

    act(() => {
      jest.advanceTimersByTime(RENDER_TIMEOUT_MS);
    });

    expect(mockRefresh).toHaveBeenCalledTimes(10);

    act(() => {
      jest.advanceTimersByTime(POLL_INTERVAL_MS * 3);
    });

    expect(mockRefresh).toHaveBeenCalledTimes(10);
  });
});
