import {
  discoverUserPoolId,
  retrieveUsers,
} from '@/src/utils/aws/cognito-util';
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';

jest.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  ...jest.requireActual('@aws-sdk/client-cognito-identity-provider'),
}));
jest.mock('@/src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
  },
}));

describe('cognito-util', () => {
  describe('discoverUserPoolId', () => {
    test('should discover user pool ID by name', async () => {
      // arrange
      const listUserPoolsSpy = jest.spyOn(
        CognitoIdentityProvider.prototype,
        'listUserPools'
      );
      listUserPoolsSpy
        .mockImplementationOnce(() => ({
          UserPools: [
            { Id: 'eu-west-2_ABC123', Name: 'nhs-notify-test1-app' },
            { Id: 'eu-west-2_DEF456', Name: 'nhs-notify-test2-app' },
          ],
          NextToken: 'page2',
        }))
        .mockImplementationOnce(() => ({
          UserPools: [
            { Id: 'eu-west-2_GHI789', Name: 'nhs-notify-test3-app' },
            { Id: 'eu-west-2_JKL012', Name: 'nhs-notify-test4-app' },
          ],
          NextToken: 'page3',
        }))
        .mockImplementationOnce(() => ({}));

      // act
      const result = await discoverUserPoolId('test3');

      // assert
      expect(result).toBe('eu-west-2_GHI789');
      expect(listUserPoolsSpy).toHaveBeenCalledTimes(3);
      expect(listUserPoolsSpy).toHaveBeenNthCalledWith(1, {
        MaxResults: 60,
        NextToken: undefined,
      });
      expect(listUserPoolsSpy).toHaveBeenNthCalledWith(2, {
        MaxResults: 60,
        NextToken: 'page2',
      });
      expect(listUserPoolsSpy).toHaveBeenNthCalledWith(3, {
        MaxResults: 60,
        NextToken: 'page3',
      });
    });

    test('should throw error if user pool not found', async () => {
      // arrange
      const listUserPoolsSpy = jest.spyOn(
        CognitoIdentityProvider.prototype,
        'listUserPools'
      );
      listUserPoolsSpy.mockImplementation(() => ({
        UserPools: [
          { Id: 'eu-west-2_ABC123', Name: 'nhs-notify-test1-app' },
          { Id: 'eu-west-2_DEF456', Name: 'nhs-notify-test2-app' },
        ],
        NextToken: undefined,
      }));

      // act
      let caughtError;
      try {
        await discoverUserPoolId('nonexistent');
      } catch (error) {
        caughtError = error;
      }

      // assert
      expect(caughtError).toBeTruthy();
      expect((caughtError as Error).message).toBe(
        'User pool nhs-notify-nonexistent-app not found'
      );
    });
  });

  describe('retrieveUsers', () => {
    test('should retrieve users from user pool', async () => {
      // arrange
      const listUsersSpy = jest.spyOn(
        CognitoIdentityProvider.prototype,
        'listUsers'
      );
      listUsersSpy
        .mockImplementationOnce(() => ({
          Users: [{ Username: 'user1' }, { Username: 'user2' }],
          PaginationToken: 'page2',
        }))
        .mockImplementationOnce(() => ({
          Users: [{ Username: 'user3' }],
          PaginationToken: 'page3',
        }))
        .mockImplementationOnce(() => ({}));

      // act
      const result = await retrieveUsers('eu-west-2_ABC123');

      // assert
      expect(result.map((u) => u.Username)).toEqual([
        'user1',
        'user2',
        'user3',
      ]);
      expect(listUsersSpy).toHaveBeenCalledTimes(3);
      expect(listUsersSpy).toHaveBeenNthCalledWith(1, {
        UserPoolId: 'eu-west-2_ABC123',
        PaginationToken: undefined,
        Limit: 60,
      });
      expect(listUsersSpy).toHaveBeenNthCalledWith(2, {
        UserPoolId: 'eu-west-2_ABC123',
        PaginationToken: 'page2',
        Limit: 60,
      });
      expect(listUsersSpy).toHaveBeenNthCalledWith(3, {
        UserPoolId: 'eu-west-2_ABC123',
        PaginationToken: 'page3',
        Limit: 60,
      });
    });
  });
});
