import { objectsToCsv } from '../data-export-csv-writer';

describe('objectsToCsv', () => {
  it('creates a csv with union headers and escaped values', () => {
    const csv = objectsToCsv([
      { a: 1, b: 'hello' },
      { b: 'he,llo', c: '"quoted"' }
    ]);

    expect(csv.split('\n')[0]).toBe('a,b,c');
    expect(csv).toContain('1,hello,');
    // he,llo must be quoted
    expect(csv).toMatch(/"he,llo"/);
    // quotes escaped
    expect(csv).toMatch(/""quoted""/);
  });
});
