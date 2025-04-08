import { parse } from 'csv-parse/sync';

export class TestDataCsv {
  private _parsed = false;

  private _headers: string[] = [];

  private _rows: string[][] = [];

  constructor(private source: Uint8Array) {}

  parse() {
    if (!this._parsed) {
      const [headers, ...rows] = parse(Buffer.from(this.source), {
        encoding: 'utf8',
        bom: true,
      });

      this._headers = headers;
      this._rows = rows;
      this._parsed = true;
    }
  }

  get headers(): string[] {
    if (!this._parsed) {
      throw new Error('CSV has not been parsed');
    }

    return [...this._headers];
  }

  get rows(): string[][] {
    if (!this._parsed) {
      throw new Error('CSV has not been parsed');
    }

    return this._rows.map((row) => [...row]);
  }
}
