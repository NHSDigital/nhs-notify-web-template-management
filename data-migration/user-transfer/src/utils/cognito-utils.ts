import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminListGroupsForUserCommand,
  GroupType,
} from '@aws-sdk/client-cognito-identity-provider';
import { Parameters } from './constants';

export type UserData = {
  userId: string;
  clientId: string;
};

export async function listCognitoUsers(
  parameters: Parameters
): Promise<Array<string> | undefined> {
  let usernames: string[] = [];
  const { region, accessKeyId, secretAccessKey, userPoolId, sessionToken } =
    parameters;
  const cognito = new CognitoIdentityProviderClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
      sessionToken,
    },
  });
  const command = new ListUsersCommand({
    UserPoolId: userPoolId,
  });

  const response = await cognito.send(command);

  if (response.Users) {
    usernames = response.Users.map((user) => user.Username as string);
    return usernames;
  }

  return undefined;
}

export async function getUserGroupAndClientId(
  usernames: string[],
  parameters: Parameters
): Promise<UserData[]> {
  const userIdAndClientId: UserData[] = [];
  const { region, accessKeyId, secretAccessKey, userPoolId, sessionToken } =
    parameters;
  const cognito = new CognitoIdentityProviderClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
      sessionToken,
    },
  });

  for (const username of usernames) {
    const userGroups = await cognito.send(
      new AdminListGroupsForUserCommand({
        UserPoolId: userPoolId,
        Username: username,
      })
    );

    if (userGroups.Groups && userGroups.Groups?.length > 0) {
      const getClientId = await getUserClientId(userGroups.Groups);
      userIdAndClientId.push({
        userId: username,
        clientId: getClientId as string,
      });
    }
  }

  return userIdAndClientId;
}

async function getUserClientId(
  userGroups: GroupType[] | undefined
): Promise<string | undefined> {
  if (userGroups && userGroups.length > 0) {
    const clientIdGroup = userGroups?.filter((group) =>
      group.GroupName?.startsWith('client:')
    );

    return clientIdGroup[0].GroupName?.split(':')[1];
  }

  return undefined;
}
