import type { Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import { handler } from '../index';

test('returns an APIGatewayAuthorizerResult', async () => {
  const methodArn =
    'arn:aws:execute-api:eu-west-2:000000000000:api-id/stage/GET/v1/example-endpoint';

  expect(
    await handler(
      {
        type: 'TOKEN',
        methodArn,
        authorizationToken: 'super-secret',
      },
      mock<Context>(),
      jest.fn()
    )
  ).toEqual({
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
  });
});
