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

const generateCSV = <T extends Record<string, string>>(
  data: T[],
  columns: ColumnDefinition<T>[]
): string => {
  const headerRow = columns.map((col) => col.header).join(',');

  const dataRows = data.map((row) =>
    columns.map((col) => `"${row[col.key]}"`).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
};

const generateHTMLTable = <T extends Record<string, unknown>>(
  data: T[],
  columns: ColumnDefinition<T>[]
): string => {
  const headerRow = columns.map((col) => `<th>${col.header}</th>`).join('');

  const dataRows = data
    .map((row) => {
      const cells = columns
        .map((col) => {
          return `<td>${row[col.key]}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  return `<table><thead><tr>${headerRow}</tr></thead><tbody>${dataRows}</tbody></table>`;
};

export const useCopyTableToClipboard = <T extends Record<string, string>>(
  options: UseCopyTableToClipboardOptions = {}
) => {
  const { successDurationMs = 5000 } = options;

  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<unknown>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

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
      setCopyError(caughtError);
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
