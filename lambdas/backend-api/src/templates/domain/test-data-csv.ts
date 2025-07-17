import { parse } from 'csv-parse/sync';
import { z } from 'zod/v4';

const $ExpectedHeaders = z.enum([
  'Personalisation field',
  'Short length data example',
  'Medium length data example',
  'Long length data example',
]);

// We expect an incoming CSV file like:
// Personalisation field,Short length data example,Medium length data example,Long length data example
// field1,Short-Example-1,Medium-Example-1,Long-Example-1
// field2,Short-Example-2,Medium-Example-2,Long-Example-2

// This parses that, and transforms it into a sensible CSV format
// field1,field2
// Short-Example-1,Short-Example-2
// Medium-Example-1,Medium-Example-2
// Long-Example-1,Long-Example-2

export class TestDataCsv {
  private _parsed = false;

  private _rows: string[][] = [];

  constructor(private source: Uint8Array) {}

  parse() {
    if (!this._parsed) {
      const [headers, ...rows]: string[][] = parse(Buffer.from(this.source), {
        encoding: 'utf8',
        bom: true,
      });

      if (
        headers.length !== $ExpectedHeaders.options.length ||
        headers.some((header, i) => header !== $ExpectedHeaders.options[i])
      ) {
        throw new Error('CSV file headers do not match expected headers');
      }

      if (
        rows.some(
          (row) =>
            row.length !== $ExpectedHeaders.options.length ||
            row.some((value) => value.trim() === '')
        )
      ) {
        throw new Error('CSV file contains a row of unexpected length');
      }

      this._rows = rows;
      this._parsed = true;
    }
  }

  get parameters(): string[] {
    if (!this._parsed) {
      throw new Error('CSV has not been parsed');
    }

    return this._rows.map(
      (row) => row[$ExpectedHeaders.options.indexOf('Personalisation field')]
    );
  }

  get short(): string[] {
    if (!this._parsed) {
      throw new Error('CSV has not been parsed');
    }

    return this._rows.map(
      (row) =>
        row[$ExpectedHeaders.options.indexOf('Short length data example')]
    );
  }

  get medium(): string[] {
    if (!this._parsed) {
      throw new Error('CSV has not been parsed');
    }

    return this._rows.map(
      (row) =>
        row[$ExpectedHeaders.options.indexOf('Medium length data example')]
    );
  }

  get long(): string[] {
    if (!this._parsed) {
      throw new Error('CSV has not been parsed');
    }

    return this._rows.map(
      (row) => row[$ExpectedHeaders.options.indexOf('Long length data example')]
    );
  }
}
