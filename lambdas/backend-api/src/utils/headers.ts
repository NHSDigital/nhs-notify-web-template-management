import type { APIGatewayProxyEventHeaders } from 'aws-lambda';

export function toHeaders(headers: APIGatewayProxyEventHeaders): Headers {
  return new Headers(
    Object.entries(headers).filter(
      (entry): entry is [string, string] => entry[1] !== undefined
    )
  );
}
