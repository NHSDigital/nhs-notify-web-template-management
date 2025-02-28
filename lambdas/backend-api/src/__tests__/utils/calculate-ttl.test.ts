import { calculateTTL } from '@backend-api/utils/calculate-ttl';

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2022-01-01 09:00'));
});

test('calculates TTL using environment variable', () => {
  process.env.MAX_SESSION_LENGTH_IN_SECONDS = '10';

  const ttl = calculateTTL();

  expect(ttl).toEqual(1_641_027_610);
});

test('calculates TTL using default value', () => {
  delete process.env.MAX_SESSION_LENGTH_IN_SECONDS;

  const ttl = calculateTTL();

  expect(ttl).toEqual(1_643_619_600);
});
