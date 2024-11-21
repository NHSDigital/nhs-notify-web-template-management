import type { APIGatewayTokenAuthorizerHandler } from 'aws-lambda';

export const handler: APIGatewayTokenAuthorizerHandler = async (event) => {
  console.log(event);

  const { methodArn } = event;

  return {
    principalId: 'api-caller',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: methodArn,
        },
      ],
    },
  };
};
