import { print } from '../../utils/log-utils';

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2022-01-01 09:00'));
});

test('print', () => {
  const consoleLogSpy = jest.spyOn(console, 'log');

  print('message');

  expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  expect(consoleLogSpy).toHaveBeenCalledWith(
    '[Sat, 01 Jan 2022 09:00:00 GMT] - message'
  );
});
