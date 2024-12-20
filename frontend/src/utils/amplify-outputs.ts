export const AMPLIFY_OUTPUTS = () => ({
  auth: {
    aws_region: 'eu-west-2',
    user_pool_id: process.env.COGNITO_USER_POOL_ID,
    user_pool_client_id: process.env.COGNITO_USER_POOL_CLIENT_ID,
  },
});
