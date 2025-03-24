import MockAdapter from 'axios-mock-adapter';
import { catchAxiosError, createAxiosClient } from '../axios-client';

const client = createAxiosClient();
const axiosMock = new MockAdapter(client);

describe('axios-client', () => {
  beforeEach(() => {
    axiosMock.reset();
  });

  describe('catchAxiosError', () => {
    test('should catch unformatted axios errors', async () => {
      axiosMock.onGet('/test').networkError();

      const response = await catchAxiosError(client.get('/test'));

      expect(response).toEqual({
        error: {
          code: 500,
          message: 'Something went wrong',
          details: new Error('Network Error'),
        },
      });

      expect(axiosMock.history.get.length).toBe(4);
    });

    test('should catch well formatted axios errors', async () => {
      axiosMock.onPost('/test').reply(400, {
        statusCode: 400,
        technicalMessage: 'Bad request',
        details: {
          message: 'Contains invalid characters',
        },
      });

      const response = await catchAxiosError(client.post('/test'));

      expect(response).toEqual({
        error: {
          code: 400,
          message: 'Bad request',
          details: {
            message: 'Contains invalid characters',
          },
        },
      });

      expect(axiosMock.history.post.length).toBe(1);
    });

    test('should catch non-axios errors', async () => {
      axiosMock.onPost('/test').reply(() => {
        throw new Error('Not an axios error');
      });

      const response = await catchAxiosError(client.post('/test'));

      expect(response).toEqual({
        error: {
          code: 500,
          message: 'Something went wrong',
          details: new Error('Not an axios error'),
        },
      });

      expect(axiosMock.history.post.length).toBe(1);
    });

    test('should return response', async () => {
      axiosMock.onGet('/test').reply(200, { data: 'test' });

      const response = await catchAxiosError(
        client.get<{ data: string }>('/test')
      );

      expect(response?.data).toEqual({ data: 'test' });

      expect(axiosMock.history.get.length).toBe(1);
    });
  });

  describe('createAxiosClient', () => {
    test('should try initial request then retry 3 times when network error', async () => {
      axiosMock.onGet('/test').networkError();

      await expect(client.get('/test')).rejects.toThrow('Network Error');

      expect(axiosMock.history.get.length).toBe(4);
    });

    test('should try initial request then retry 3 times when a 500 response', async () => {
      axiosMock.onGet('/test').reply(500);

      await expect(client.get('/test')).rejects.toThrow(
        'Request failed with status code 500'
      );

      expect(axiosMock.history.get.length).toBe(4);
    });

    test('should not retry on 400 errors', async () => {
      axiosMock.onPost('/test').reply(400);

      await expect(client.post('/test')).rejects.toThrow(
        'Request failed with status code 400'
      );

      expect(axiosMock.history.post.length).toBe(1); // No retries
    });

    test('should stop retrying after successful response', async () => {
      axiosMock.onGet('/test').replyOnce(429);

      axiosMock.onGet('/test').replyOnce(429);

      axiosMock.onGet('/test').replyOnce(200, { data: 'test' });

      const response = await client.get('/test');

      expect(response.data).toEqual({ data: 'test' });

      expect(axiosMock.history.get.length).toBe(3);
    });
  });
});
