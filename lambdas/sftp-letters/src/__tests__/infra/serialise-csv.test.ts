import { serialise } from '../../infra/serialise-csv';

describe('serialise', () => {
  test('Produces csv string with fields in quotes', async () => {
    const headers = 'a,b';
    const records = [
      { a: 'a value 1', b: 'b value 1' },
      { a: 'a value 2', b: 'b value 2' },
    ];

    expect(await serialise(records, headers)).toEqual(
      'a,b\n"a value 1","b value 1"\n"a value 2","b value 2"'
    );
  });

  test('Filters csv to headers', async () => {
    const headers = 'a,b';
    const records = [
      { c: 'c value', a: 'a value 1', b: 'b value 1' },
      { a: 'a value 2', b: 'b value 2', d: 'd value', e: 'e value' },
    ];

    expect(await serialise(records, headers)).toEqual(
      'a,b\n"a value 1","b value 1"\n"a value 2","b value 2"'
    );
  });

  test('Strips newlines in csv', async () => {
    const headers = 'a,b';
    const records = [
      { a: 'a value\n1', b: 'b value 1' },
      { a: 'a value 2', b: 'b value 2' },
    ];

    expect(await serialise(records, headers)).toEqual(
      'a,b\n"a value 1","b value 1"\n"a value 2","b value 2"'
    );
  });

  test('Strips whitespace in csv', async () => {
    const headers = 'a,b';
    const records = [
      { a: ' a value 1 ', b: 'b value 1' },
      { a: 'a value 2', b: 'b value 2' },
    ];

    expect(await serialise(records, headers)).toEqual(
      'a,b\n"a value 1","b value 1"\n"a value 2","b value 2"'
    );
  });
});
