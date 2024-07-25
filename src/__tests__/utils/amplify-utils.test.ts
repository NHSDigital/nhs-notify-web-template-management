/**
 * @jest-environment node
 */

import { mockDeep } from 'jest-mock-extended';
import { getAmplifyBackendClient } from '@/src/utils/amplify-utils';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/data';
import { readFileSync } from 'node:fs';

jest.mock('@aws-amplify/adapter-nextjs/data');
jest.mock('node:fs');

beforeEach(() => jest.clearAllMocks());

test('getAmplifyBackendClient', () => {
  const mockClient =
    mockDeep<ReturnType<typeof generateServerClientUsingCookies>>();

  const mockGenerateServerClient = jest.fn(() => mockClient);

  jest.mocked(readFileSync).mockReturnValue('{}');
  jest
    .mocked(generateServerClientUsingCookies)
    .mockImplementation(mockGenerateServerClient);

  const backendClient = getAmplifyBackendClient();

  expect(backendClient).toEqual(mockClient);
});

test('getAmplifyBackendClient - handles error', () => {
  const mockClient =
    mockDeep<ReturnType<typeof generateServerClientUsingCookies>>();

  const mockGenerateServerClient = jest.fn(() => mockClient);

  jest.mocked(readFileSync).mockImplementation(() => {
    throw new Error('fs error');
  });
  jest
    .mocked(generateServerClientUsingCookies)
    .mockImplementation(mockGenerateServerClient);

  const backendClient = getAmplifyBackendClient();

  expect(backendClient).toEqual(mockClient);
});
