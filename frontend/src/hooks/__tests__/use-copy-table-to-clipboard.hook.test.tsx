import { renderHook, act } from '@testing-library/react';
import { useCopyTableToClipboard } from '../use-copy-table-to-clipboard.hook';

type TestData = Record<string, unknown> & {
  name: string;
  id: string;
  value: number;
};

describe('useCopyTableToClipboard', () => {
  let mockClipboardWrite: jest.Mock;

  beforeEach(() => {
    mockClipboardWrite = jest.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', {
      value: { write: mockClipboardWrite },
      writable: true,
      configurable: true,
    });

    global.ClipboardItem = jest.fn(
      (data) => data
    ) as unknown as typeof ClipboardItem;

    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should copy data in both CSV and HTML formats to clipboard', async () => {
    const { result } = renderHook(() => useCopyTableToClipboard<TestData>());

    const testData: TestData[] = [
      { name: 'Test "quoted" value', id: 'id-1', value: 100 },
      { name: '<script>alert("xss")</script>', id: 'id & value', value: 200 },
    ];

    await act(async () => {
      await result.current.copyToClipboard({
        data: testData,
        columns: [
          { key: 'name', header: 'Name' },
          { key: 'id', header: 'ID' },
        ],
      });
    });

    expect(mockClipboardWrite).toHaveBeenCalledTimes(1);

    const callArgs = mockClipboardWrite.mock.calls[0][0];
    const clipboardItem = callArgs[0];
    const csv = clipboardItem['text/plain'];
    const html = clipboardItem['text/html'];

    expect(csv).toContain('"Name","ID"');
    expect(csv).toContain('"Test ""quoted"" value","id-1"');
    expect(csv).toContain('"id & value"');

    expect(html).toContain('<table>');
    expect(html).toContain('<th>Name</th>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('id &amp; value');
    expect(html).not.toContain('<script>');

    expect(result.current.copied).toBe(true);
    expect(result.current.error).toBeNull();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.copied).toBe(false);
  });

  it('should handle clipboard write failures', async () => {
    mockClipboardWrite.mockRejectedValueOnce(new Error('Permission denied'));

    const { result } = renderHook(() => useCopyTableToClipboard<TestData>());

    await act(async () => {
      await result.current.copyToClipboard({
        data: [{ name: 'Test', id: 'id-1', value: 100 }],
        columns: [{ key: 'name', header: 'Name' }],
      });
    });

    expect(result.current.error).toEqual(new Error('Permission denied'));
    expect(result.current.copied).toBe(false);

    // Error clears on successful copy
    mockClipboardWrite.mockResolvedValueOnce(undefined);

    await act(async () => {
      await result.current.copyToClipboard({
        data: [{ name: 'Test', id: 'id-1', value: 100 }],
        columns: [{ key: 'name', header: 'Name' }],
      });
    });

    expect(result.current.error).toBeNull();
    expect(result.current.copied).toBe(true);
  });

  it('should handle non-Error exceptions', async () => {
    mockClipboardWrite.mockRejectedValueOnce('String error');

    const { result } = renderHook(() => useCopyTableToClipboard<TestData>());

    await act(async () => {
      await result.current.copyToClipboard({
        data: [{ name: 'Test', id: 'id-1', value: 100 }],
        columns: [{ key: 'name', header: 'Name' }],
      });
    });

    expect(result.current.error).toEqual(
      new Error('Failed to copy to clipboard')
    );
    expect(result.current.copied).toBe(false);
  });

  it('should cleanup timeout on unmount', async () => {
    const { result, unmount } = renderHook(() =>
      useCopyTableToClipboard<TestData>()
    );

    await act(async () => {
      await result.current.copyToClipboard({
        data: [{ name: 'Test', id: 'id-1', value: 100 }],
        columns: [{ key: 'name', header: 'Name' }],
      });
    });

    expect(result.current.copied).toBe(true);

    unmount();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // No errors thrown - cleanup successful
  });
});
