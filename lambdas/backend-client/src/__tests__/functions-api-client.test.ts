import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { FunctionsApiClient } from '../functions-api-client';

const axiosMock = new MockAdapter(axios);

describe('FunctionsAPIClient', () => {
  test('sendEmail - should return error', async () => {
    axiosMock.onPost('/v1/email').reply(500, {
      statusCode: 500,
      technicalMessage: 'Internal server error',
    });

    const client = new FunctionsApiClient('token');

    const result = await client.sendEmail('real-id');

    expect(result.error).toEqual({
      code: 500,
      message: 'Internal server error',
    });

    expect(result.data).toBeUndefined();

    expect(axiosMock.history.post.length).toBe(4);
  });

  test('sendEmail - should return success', async () => {
    axiosMock.onPost('/v1/email').reply(200, {
      statusCode: 200,
    });

    const client = new FunctionsApiClient('token');

    const result = await client.sendEmail('real-id');

    expect(result.error).toBeUndefined();

    expect(result.data).toBeUndefined();
  });
});
