import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import { handler } from '../index';

test('returns an APIGatewayProxyResult', async () => {
  expect(
    await handler(mock<APIGatewayProxyEvent>(), mock<Context>(), jest.fn())
  ).toEqual({
    statusCode: 200,
    body: '{}',
  });
});
