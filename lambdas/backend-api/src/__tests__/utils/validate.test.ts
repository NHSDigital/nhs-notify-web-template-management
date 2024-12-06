import { z } from 'zod';
import { validate } from '../../utils';

describe('validate', () => {
  test('should return error when schema is invalid', async () => {
    const result = await validate(
      z.object({
        id: z.string(),
      }),
      { notId: 'notId' }
    );

    expect(result).toEqual({
      error: {
        code: 400,
        message: 'Request failed validation',
        actualError: {
          fieldErrors: {
            id: ['Required'],
          },
          formErrors: [],
        },
        details: {
          id: 'Required',
        },
      },
    });
  });

  test('should return data', async () => {
    const result = await validate(
      z.object({
        id: z.string(),
      }),
      { id: 'real-id' }
    );

    expect(result).toEqual({
      data: {
        id: 'real-id',
      },
    });
  });
});
