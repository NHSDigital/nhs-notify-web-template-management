import { z } from 'zod';
import { parseJsonPreprocessor } from '@backend-api/utils/zod-json-preprocessor';
import { mock } from 'jest-mock-extended';

describe('parseJsonPreprocessor', () => {
  it('should return JSON', () => {
    const addIssue = jest.fn();

    const context = mock<z.RefinementCtx>({ addIssue });

    const val = parseJsonPreprocessor(
      JSON.stringify({ name: 'example' }),
      context
    );

    expect(addIssue).not.toHaveBeenCalled();

    expect(val).toEqual({ name: 'example' });
  });

  it('should return value when value is not a string', () => {
    const addIssue = jest.fn();

    const context = mock<z.RefinementCtx>({ addIssue });

    const val = parseJsonPreprocessor({}, context);

    expect(addIssue).not.toHaveBeenCalled();

    expect(val).toEqual({});
  });

  it('should add error to context when unable to parse JSON', () => {
    const addIssue = jest.fn();

    const context = mock<z.RefinementCtx>({ addIssue });

    const val = parseJsonPreprocessor('not valid json', context);

    expect(addIssue).toHaveBeenCalledWith({
      code: z.ZodIssueCode.custom,
      message: 'Unexpected token \'o\', "not valid json" is not valid JSON',
    });

    expect(val).toEqual('not valid json');
  });
});
