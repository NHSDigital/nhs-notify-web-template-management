import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import {
  LetterRenderPollingProvider,
  useLetterRenderPolling,
} from '@providers/letter-render-polling-provider';

function TestConsumer() {
  const { isAnyTabPolling } = useLetterRenderPolling();

  return <p data-testid='polling-state'>{String(isAnyTabPolling)}</p>;
}

describe('LetterRenderPollingProvider', () => {
  it('provides isAnyTabPolling as false by default', () => {
    render(
      <LetterRenderPollingProvider>
        <TestConsumer />
      </LetterRenderPollingProvider>
    );

    expect(screen.getByTestId('polling-state')).toHaveTextContent('false');
  });

  it('updates isAnyTabPolling when registerPolling is called', () => {
    const wrapper = ({ children }: PropsWithChildren) => (
      <LetterRenderPollingProvider>{children}</LetterRenderPollingProvider>
    );

    const { result } = renderHook(() => useLetterRenderPolling(), { wrapper });

    expect(result.current.isAnyTabPolling).toBe(false);

    act(() => {
      result.current.registerPolling('shortFormRender', true);
    });

    expect(result.current.isAnyTabPolling).toBe(true);

    act(() => {
      result.current.registerPolling('shortFormRender', false);
    });

    expect(result.current.isAnyTabPolling).toBe(false);
  });

  it('tracks multiple keys independently', () => {
    const wrapper = ({ children }: PropsWithChildren) => (
      <LetterRenderPollingProvider>{children}</LetterRenderPollingProvider>
    );

    const { result } = renderHook(() => useLetterRenderPolling(), { wrapper });

    act(() => {
      result.current.registerPolling('shortFormRender', true);
      result.current.registerPolling('longFormRender', false);
    });

    expect(result.current.isAnyTabPolling).toBe(true);

    act(() => {
      result.current.registerPolling('shortFormRender', false);
    });

    expect(result.current.isAnyTabPolling).toBe(false);
  });

  it('returns true when any key is polling', () => {
    const wrapper = ({ children }: PropsWithChildren) => (
      <LetterRenderPollingProvider>{children}</LetterRenderPollingProvider>
    );

    const { result } = renderHook(() => useLetterRenderPolling(), { wrapper });

    act(() => {
      result.current.registerPolling('shortFormRender', true);
      result.current.registerPolling('longFormRender', true);
    });

    expect(result.current.isAnyTabPolling).toBe(true);

    act(() => {
      result.current.registerPolling('shortFormRender', false);
    });

    // longFormRender is still polling
    expect(result.current.isAnyTabPolling).toBe(true);

    act(() => {
      result.current.registerPolling('longFormRender', false);
    });

    expect(result.current.isAnyTabPolling).toBe(false);
  });
});

describe('useLetterRenderPolling', () => {
  it('throws when used outside provider', () => {
    expect(() => render(<TestConsumer />)).toThrow(
      'useLetterRenderPolling must be used within LetterRenderPollingProvider'
    );
  });
});
