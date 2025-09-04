import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminListGroupsForUserCommand,
  AdminListGroupsForUserCommandInput,
  UserType,
  GroupType,
} from '@aws-sdk/client-cognito-identity-provider';

const cognito = new CognitoIdentityProviderClient({
  region: 'eu-west-2',
});
const USER_POOL_ID = 'eu-west-2_OX5mAA0VI';

interface CognitoUserBasics {
  username: string;
  sub?: string;
  clientIdAttr?: string;
  poolId: string;
  user?: UserType;
}

export async function findCognitoUser(
  ownerId: string
): Promise<CognitoUserBasics | undefined> {
  console.log('owner', ownerId);
  const listUser = new ListUsersCommand({
    UserPoolId: USER_POOL_ID,
    Filter: `"sub"="${ownerId}"`,
  });
  const res = await cognito.send(listUser);
  const user = res.Users?.[0];
  if (user) {
    const sub = user.Attributes?.find((a) => a.Name === 'sub')?.Value;
    const clientIdAttr = user.Attributes?.find(
      (a) => a.Name === 'custom:sbx_client_id' // this would be removed when migrating for production
    )?.Value;
    return {
      username: user.Username!,
      sub,
      clientIdAttr,
      poolId: USER_POOL_ID,
      user,
    };
  }
  return undefined;
}

export async function getUserGroup(
  input: AdminListGroupsForUserCommandInput
): Promise<string | undefined> {
  const { Username, UserPoolId } = input;

  const userGroups = await cognito.send(
    new AdminListGroupsForUserCommand({
      UserPoolId,
      Username,
    })
  );

  return userGroups.Groups && userGroups.Groups?.length === 0
    ? undefined
    : await getUserClientId(userGroups.Groups);
}

async function getUserClientId(
  userGroups: GroupType[] | undefined
): Promise<string | undefined> {
  if (userGroups && userGroups.length > 0) {
    const clientIdGroup = userGroups?.filter((group) =>
      group.GroupName?.includes('client')
    );

    return clientIdGroup[0].GroupName?.split(':')[0];
  }

  return undefined;
}
