import type { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event) => {
  // eslint-disable-next-line no-console
  console.log(event);

  return {
    statusCode: 200,
    body: JSON.stringify({}),
  };
};
