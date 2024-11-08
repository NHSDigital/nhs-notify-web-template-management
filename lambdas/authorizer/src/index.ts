import type { APIGatewayAuthorizerHandler } from 'aws-lambda';

export const handler: APIGatewayAuthorizerHandler = async (event) => {
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
