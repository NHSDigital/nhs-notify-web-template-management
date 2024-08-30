/**
 * @jest-environment node
 */
import { getAmplifyBackendClient } from '@utils/amplify-utils';
import amplifyApi from '@aws-amplify/adapter-nextjs/api';
import nextHeaders from 'next/headers';

const mockClient = {
  name: 'mockClient',
};

jest.mock('@aws-amplify/adapter-nextjs/data', () => ({
  generateServerClientUsingCookies: () => mockClient,
}));
jest.mock('@/amplify_outputs.json', () => ({
  name: 'mockConfig',
}));
jest.mock('next/headers', () => ({
  cookies: () => {},
}));

beforeEach(() => jest.clearAllMocks());

test('getAmplifyBackendClient', () => {
  // arrange
  const generateServerClientUsingCookiesSpy = jest.spyOn(
    amplifyApi,
    'generateServerClientUsingCookies'
  );
  const cookiesSpy = jest.spyOn(nextHeaders, 'cookies');

  // act
  const backendClient = getAmplifyBackendClient();

  // assert
  expect(backendClient).toEqual(mockClient);
  expect(generateServerClientUsingCookiesSpy).toHaveBeenCalledTimes(1);
  expect(generateServerClientUsingCookiesSpy).toHaveBeenCalledWith({
    config: { name: 'mockConfig' },
    cookies: cookiesSpy,
    authMode: 'iam',
  });
});
