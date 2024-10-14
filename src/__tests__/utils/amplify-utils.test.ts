/**
 * @jest-environment node
 */
import { getAmplifyBackendClient } from '@utils/amplify-utils';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/api';
import nextHeaders from 'next/headers';

jest.mock('@aws-amplify/adapter-nextjs/api');
jest.mock('@/amplify_outputs.json', () => ({
  name: 'mockConfig',
}));
jest.mock('next/headers', () => ({
  cookies: () => {},
}));

const ENV = process.env;

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetModules(); // Most important - it clears the cache
  process.env = { ...ENV }; // Make a copy
});

afterAll(() => {
  process.env = ENV; // Restore old environment
});

test('getAmplifyBackendClient', () => {
  // arrange
  const generateServerClientUsingCookiesMock = jest.mocked(
    generateServerClientUsingCookies
  );
  const cookiesSpy = jest.spyOn(nextHeaders, 'cookies');

  // act
  getAmplifyBackendClient();

  // assert
  expect(generateServerClientUsingCookiesMock).toHaveBeenCalledTimes(1);
  expect(generateServerClientUsingCookiesMock).toHaveBeenCalledWith({
    config: { name: 'mockConfig' },
    cookies: cookiesSpy,
    authMode: 'iam',
  });
});

test('getAmplifyBackendClient without proper config params', () => {
  process.env.FEATURE_VISIBILITY_TESTING = 'on';
  // arrange
  const generateServerClientUsingCookiesMock = jest.mocked(
    generateServerClientUsingCookies
  );
  const cookiesSpy = jest.spyOn(nextHeaders, 'cookies');

  // act
  getAmplifyBackendClient();

  // assert
  expect(generateServerClientUsingCookiesMock).toHaveBeenCalledTimes(1);
  expect(generateServerClientUsingCookiesMock).toHaveBeenCalledWith({
    config: {},
    cookies: cookiesSpy,
    authMode: 'iam',
  });
});
