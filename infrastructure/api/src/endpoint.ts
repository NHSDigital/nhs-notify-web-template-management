import type { APIGatewayProxyHandler } from 'aws-lambda';


export const handler: APIGatewayProxyHandler = async (event) => {
    console.log(event);

    return {
      statusCode: 201,
      body: JSON.stringify({})
    }
}
