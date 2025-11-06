import { _test, handler, createHandler } from '../src/queue-csv-writer';
import { S3Client } from '@aws-sdk/client-s3';

// Minimal mock by monkey patching send
jest.mock('@aws-sdk/client-s3', () => {
  const actual = jest.requireActual('@aws-sdk/client-s3');
  return {
    ...actual,
    S3Client: jest.fn().mockImplementation(() => ({ send: jest.fn().mockResolvedValue({}) }))
  };
});

describe('queue-csv-writer lambda', () => {
  beforeEach(() => {
    process.env.EVENT_CSV_BUCKET_NAME = 'test-bucket';
  });

  test('buildCsv produces header union and rows', () => {
    const csv = _test.buildCsv([
      { a: 1, b: 'x' },
      { b: 'y', c: true }
    ]);
    expect(csv.split('\n')[0]).toBe('a,b,c');
    expect(csv).toContain('1,x,'); // first row
    expect(csv).toContain(',y,true'); // second row
  });

  test('buildCsv returns empty string for no rows', () => {
    expect(_test.buildCsv([])).toBe('');
  });

  // Custom CSV row splitter that respects quoted multiline fields
  function splitCsvRows(csv: string): string[] {
    const rows: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < csv.length; i++) {
      const ch = csv[i];
      if (ch === '"') {
        // Handle escaped quotes inside a quoted field
        if (inQuotes && csv[i + 1] === '"') {
          current += '""';
          i++;
          continue;
        }
        inQuotes = !inQuotes;
        current += ch;
        continue;
      }
      if (ch === '\n' && !inQuotes) {
        rows.push(current);
        current = '';
        continue;
      }
      current += ch;
    }
    rows.push(current);
    return rows;
  }

  test('escapeCsv quotes commas, quotes and newlines', () => {
    const csv = _test.buildCsv([
      { text: 'hello, world' },
      { text: 'line1\nline2' },
      { text: 'He said "Hi"' }
    ]);
    const rows = splitCsvRows(csv);
    expect(rows[1]).toBe('"hello, world"');
    expect(rows[2]).toBe('"line1\nline2"');
    expect(rows[3]).toBe('"He said ""Hi"""');
  });

  test('escapeCsv leaves simple values unquoted and null -> empty', () => {
    const csv = _test.buildCsv([
      { a: 'simple', b: null },
    ]);
    const rows = splitCsvRows(csv);
    expect(rows[0]).toBe('a,b');
    expect(rows[1]).toBe('simple,');
  });

  test('escapeCsv handles object value by JSON stringifying', () => {
    const csv = _test.buildCsv([
      { obj: { nested: 'v', n: 1 } },
    ]);
    const rows = splitCsvRows(csv);
    // Object includes braces and quotes so must be quoted and escaped
    expect(rows[0]).toBe('obj');
    // Expect doubled quotes inside the quoted JSON per RFC4180 escaping logic
    expect(rows[1]).toBe('"{""nested"":""v"",""n"":1}"');
  });

  test('handler uploads csv when data present', async () => {
    const event = {
      Records: [
        { body: JSON.stringify({ data: { a: 1, b: 'x' } }) },
        { body: JSON.stringify({ data: { a: 2, c: 'z' } }) }
      ]
    } as any;
    // Use a fresh handler instance to avoid any prior side effects
    const localHandler = createHandler({ s3Client: new S3Client({}) } as any);
    const result = await localHandler(event);
    expect(result.status).toBe('ok');
    expect(result.rows).toBe(2);
    expect(result.skipped).toBe(0);
  });

  test('handler throws when bucket env missing', async () => {
    delete process.env.EVENT_CSV_BUCKET_NAME;
    const event = { Records: [{ body: JSON.stringify({ data: { a: 1 } }) }] } as any;
    const localHandler = createHandler({ s3Client: new S3Client({}) } as any);
    await expect(localHandler(event)).rejects.toThrow('EVENT_CSV_BUCKET_NAME not set');
  });

  test('handler returns no-data when none present', async () => {
    const event = { Records: [{ body: '{}' }] } as any;
    const result = await handler(event);
    expect(result.status).toBe('no-data');
    expect(result.skipped).toBeGreaterThanOrEqual(1);
  });

  test('handler skips malformed JSON', async () => {
    const event = { Records: [{ body: 'not-json' }] } as any;
    const container = { s3Client: new S3Client({ region: 'eu-west-2' }) } as any;
    const localHandler = createHandler(container);
    const res = await localHandler(event);
    expect(res.status).toBe('no-data');
    expect(res.skipped).toBe(1);
  });
});
