/* eslint-disable unicorn/no-null */
import { removeUndefinedFromObject } from '@utils/remove-undefined';

type TestType = {
  param1: string;
  param2: Array<string>;
  param3: unknown;
  param4: number;
  param5: string | null;
  param6: string | undefined;
  param7?: string;
};

test('remove-undefined - all defined', () => {
  const testData: TestType = {
    param1: 'test',
    param2: ['test'],
    param3: { a: 1 },
    param4: 4,
    param5: 'test',
    param6: 'test',
    param7: 'test',
  };

  const result: TestType = removeUndefinedFromObject(testData);

  expect(JSON.stringify(result)).toEqual(
    '{"param1":"test","param2":["test"],"param3":{"a":1},"param4":4,"param5":"test","param6":"test","param7":"test"}'
  );
  expect(Object.keys(result).sort()).toEqual([
    'param1',
    'param2',
    'param3',
    'param4',
    'param5',
    'param6',
    'param7',
  ]);
});

test('remove-undefined - mixed data', () => {
  const testData: TestType = {
    param1: '',
    param2: [],
    param3: {},
    param4: 0,
    param5: null,
    param6: undefined,
  };

  const result: TestType = removeUndefinedFromObject(testData);

  expect(JSON.stringify(result)).toEqual(
    '{"param1":"","param2":[],"param3":{},"param4":0,"param5":null}'
  );
  expect(Object.keys(result).sort()).toEqual([
    'param1',
    'param2',
    'param3',
    'param4',
    'param5',
  ]);
});
