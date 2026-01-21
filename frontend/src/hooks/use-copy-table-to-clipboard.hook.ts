import { useState, useRef, useEffect } from 'react';

export type ColumnDefinition<T> = {
  key: keyof T;
  header: string;
};

type UseCopyTableToClipboardOptions = {
  successDurationMs?: number;
};

type CopyToClipboardParams<T> = {
  data: T[];
  columns: ColumnDefinition<T>[];
};

const escapeCSVValue = (value: unknown): string => {
  const stringValue = String(value ?? '');
  // Wrap in quotes and escape existing quotes by doubling them
  return `"${stringValue.replaceAll('"', '""')}"`;
};

const generateCSV = <T extends Record<string, unknown>>(
  data: T[],
  columns: ColumnDefinition<T>[]
): string => {
  const headerRow = columns.map((col) => escapeCSVValue(col.header)).join(',');

  const dataRows = data.map((row) =>
    columns.map((col) => escapeCSVValue(row[col.key])).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
};

const escapeHTMLValue = (value: unknown): string => {
  const stringValue = String(value ?? '');
  return stringValue
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
};

const generateHTMLTable = <T extends Record<string, unknown>>(
  data: T[],
  columns: ColumnDefinition<T>[]
): string => {
  const headerRow = columns
    .map((col) => `<th>${escapeHTMLValue(col.header)}</th>`)
    .join('');

  const dataRows = data
    .map((row) => {
      const cells = columns
        .map((col) => {
          return `<td>${escapeHTMLValue(row[col.key])}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  return `<table><thead><tr>${headerRow}</tr></thead><tbody>${dataRows}</tbody></table>`;
};

export const useCopyTableToClipboard = <T extends Record<string, unknown>>(
  options: UseCopyTableToClipboardOptions = {}
) => {
  const { successDurationMs = 5000 } = options;

  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const copyToClipboard = async (params: CopyToClipboardParams<T>) => {
    try {
      setCopyError(null);
      setCopied(false);

      const csv = generateCSV(params.data, params.columns);
      const html = generateHTMLTable(params.data, params.columns);

      const clipboardItem = new ClipboardItem({
        'text/plain': csv,
        'text/html': html,
      });

      await navigator.clipboard.write([clipboardItem]);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setCopied(true);

      timeoutRef.current = setTimeout(
        () => setCopied(false),
        successDurationMs
      );
    } catch (caughtError) {
      const errorToSet =
        caughtError instanceof Error
          ? caughtError
          : new Error('Failed to copy to clipboard');
      setCopyError(errorToSet);
      setCopied(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    copyToClipboard,
    copied,
    error: copyError,
  };
};
