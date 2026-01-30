import { renderHook, act } from '@testing-library/react';
import { useCopyTableToClipboard } from '../../hooks/use-copy-table-to-clipboard.hook';

type TestData = {
  name: string;
  id: string;
  value: string;
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
      { name: 'Test "quoted" value', id: 'id-1', value: '100' },
      { name: '<template test name>', id: 'id & value', value: '200' },
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

    const [clipboardItem] = mockClipboardWrite.mock.calls[0][0];
    const csv = clipboardItem['text/plain'];
    const html = clipboardItem['text/html'];

    const expectedCSV = [
      'Name,ID',
      '"Test ""quoted"" value","id-1"',
      '"<template test name>","id & value"',
    ].join('\n');

    expect(csv).toEqual(expectedCSV);

    const expectedHTML = `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>ID</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Test &quot;quoted&quot; value</td>
          <td>id-1</td>
        </tr>
        <tr>
          <td>&lt;template test name&gt;</td>
          <td>id &amp; value</td>
        </tr>
      </tbody>
    </table>`
      .replaceAll(/>\s+</g, '><')
      .trim();

    expect(html).toEqual(expectedHTML);

    expect(result.current.copied).toBe(true);
    expect(result.current.copyError).toBeNull();

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
        data: [{ name: 'Test', id: 'id-1', value: '100' }],
        columns: [{ key: 'name', header: 'Name' }],
      });
    });

    expect(result.current.copyError).toEqual(new Error('Permission denied'));
    expect(result.current.copied).toBe(false);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.copyError).toBeNull();

    mockClipboardWrite.mockResolvedValueOnce(undefined);

    await act(async () => {
      await result.current.copyToClipboard({
        data: [{ name: 'Test', id: 'id-1', value: '100' }],
        columns: [{ key: 'name', header: 'Name' }],
      });
    });

    expect(result.current.copyError).toBeNull();
    expect(result.current.copied).toBe(true);
  });

  it('should clear previous timeout when copying multiple times', async () => {
    const { result } = renderHook(() => useCopyTableToClipboard<TestData>());

    const testData: TestData[] = [{ name: 'Test 1', id: 'id-1', value: '100' }];

    await act(async () => {
      await result.current.copyToClipboard({
        data: testData,
        columns: [{ key: 'name', header: 'Name' }],
      });
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(2500);
    });

    expect(result.current.copied).toBe(true);

    await act(async () => {
      await result.current.copyToClipboard({
        data: testData,
        columns: [{ key: 'name', header: 'Name' }],
      });
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(2500);
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(2500);
    });

    expect(result.current.copied).toBe(false);
  });
});
