import { mockDeep } from 'jest-mock-extended';
import { CognitoRepository } from '../../utils/cognito-repository';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

test('getAllUsers', async () => {
  const mockCognitoClient = mockDeep<CognitoIdentityProviderClient>({
    send: jest
      .fn()
      .mockResolvedValueOnce({
        Users: [
          {
            Username: 'username-1',
            Attributes: [
              {
                Name: 'sub',
                Value: 'sub-1',
              },
            ],
          },
          {
            Username: 'username-2',
          },
        ],
      })
      .mockResolvedValueOnce({
        Groups: [
          {
            GroupName: 'client:client-1',
          },
        ],
      })
      .mockResolvedValueOnce({
        Groups: [],
      }),
  });

  const cognitoRepository = new CognitoRepository(
    'user-pool-id',
    mockCognitoClient
  );

  const users = await cognitoRepository.getAllUsers();

  expect(users).toEqual([
    {
      username: 'username-1',
      clientId: 'client-1',
      userId: 'sub-1',
    },
  ]);
});

test('getAllUser - throws error', async () => {
  const mockCognitoClient = mockDeep<CognitoIdentityProviderClient>({
    send: jest
      .fn()
      .mockResolvedValueOnce({
        Users: [
          {
            Username: 'username-1',
            Attributes: [
              {
                Name: 'sub',
                Value: 'sub-1',
              },
            ],
          },
        ],
      })
      .mockImplementation(() => {
        throw new Error('error');
      }),
  });

  const cognitoRepository = new CognitoRepository(
    'user-pool-id',
    mockCognitoClient
  );

  await expect(
    async () => await cognitoRepository.getAllUsers()
  ).rejects.toThrow('error');
});
