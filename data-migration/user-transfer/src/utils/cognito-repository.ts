/* eslint-disable sonarjs/no-commented-code */
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUsersCommandInput,
  AdminListGroupsForUserCommand,
  UserType,
  GroupType,
} from '@aws-sdk/client-cognito-identity-provider';
import { print } from './log-utils';
import { UserData } from './types';

export class CognitoRepository {
  constructor(
    private readonly userPoolId: string,
    private readonly client: CognitoIdentityProviderClient
  ) {}

  async getAllUsers(): Promise<UserData[]> {
    const users: UserData[] = [];

    let paginationToken: string | undefined;

    try {
      do {
        const params: ListUsersCommandInput = {
          UserPoolId: this.userPoolId,
          Limit: 60, // Max allowed by AWS
          PaginationToken: paginationToken,
        };

        const command = new ListUsersCommand(params);

        const response = await this.client.send(command);

        if (response.Users) {
          const userBatch = await Promise.all(
            response.Users.map((user) => this.processUser(user))
          );

          users.push(...userBatch.filter((r) => r !== undefined));
        }

        paginationToken = response.PaginationToken;
      } while (paginationToken);

      return users;
    } catch (error) {
      print('Failed: fetching users');
      throw error;
    }
  }

  private async processUser(user: UserType): Promise<UserData | undefined> {
    const username = user.Username!;

    const userId = user.Attributes?.find(({ Name }) => Name === 'sub')?.Value;

    const clientId = await this.getClientIdFromGroups(username);

    if (!clientId || !userId) {
      print(`Ignoring User: ${username}. No client or sub assigned`);
      return;
    }

    return {
      username,
      clientId,
      userId,
    };
  }

  private async getClientIdFromGroups(
    username: string
  ): Promise<string | undefined> {
    try {
      const command = new AdminListGroupsForUserCommand({
        UserPoolId: this.userPoolId,
        Username: username,
      });

      const response = await this.client.send(command);

      const clientGroup = response.Groups?.find((group: GroupType) =>
        group.GroupName?.startsWith('client:')
      );

      return clientGroup?.GroupName?.split(':')[1];
    } catch (error) {
      print(`Failed: to get groups for user ${username}`);
      throw error;
    }
  }
}
