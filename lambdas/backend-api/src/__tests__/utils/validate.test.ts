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
        actualError: {
          fieldErrors: {
            id: ['Invalid input: expected string, received undefined'],
          },
          formErrors: [],
        },
        errorMeta: {
          code: 400,
          description: 'Request failed validation',
          details: {
            id: 'Invalid input: expected string, received undefined',
          },
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
      { path: [], message: 'Root issue' },
      {
        path: [Symbol()],
        message: 'message',
      },
      {
        path: ['example-path'],
        message: 'message',
      },
    ],
  });

  const output = formatZodErrors(zodError);

  expect(output).toEqual({ 'example-path': 'message', $root: 'Root issue' });
});
