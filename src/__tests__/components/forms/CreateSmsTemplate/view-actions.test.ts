import { calculateHowManySmsMessages } from '@forms/CreateSmsTemplate/view-actions';

describe('calculateHowManySmsMessages', () => {
  test.each([
    { val: 'ABC' as unknown as number, expected: 0 },
    { val: Number('ABC'), expected: 0 },
    { val: 0, expected: 0 },
    { val: 1, expected: 1 },
    { val: 160, expected: 1 },
    { val: 161, expected: 2 },
    { val: 306, expected: 2 },
    { val: 307, expected: 3 },
    { val: 459, expected: 3 },
    { val: 460, expected: 4 },
    { val: 612, expected: 4 },
    { val: 613, expected: 5 },
    { val: 765, expected: 5 },
    { val: 766, expected: 6 },
    { val: 918, expected: 6 },
  ])(
    'returns $expected text message block for $val characters',
    ({ val, expected }) => {
      expect(calculateHowManySmsMessages(val)).toBe(expected);
    }
  );
});
