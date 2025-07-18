import { validate, formatZodErrors } from '../../utils';
import { mockDeep } from 'jest-mock-extended';
import { z, ZodError } from 'zod/v4';

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
            id: ['Invalid input: expected string, received undefined'],
          },
          formErrors: [],
        },
        details: {
          id: 'Invalid input: expected string, received undefined',
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

test('formatZodError', () => {
  const zodError = mockDeep<ZodError>({
    issues: [
      {
        path: [Symbol()],
        message: 'message',
      },
      {
        path: ['path'],
        message: 'message',
      },
    ],
  });

  const output = formatZodErrors(zodError);

  expect(output).toEqual({ path: 'message' });
});
