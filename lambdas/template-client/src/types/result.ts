import { ErrorCase } from './error-cases';

type TemplateError = {
  code: ErrorCase;
  message: string;
  actualError?: unknown;
};

export type SuccessResult<T> = { error?: never } & { data: T };

export type FailureResult = { error: TemplateError } & { data?: never };

export type Result<T> = SuccessResult<T> | FailureResult;

export const failure = (
  code: ErrorCase,
  message: string,
  error?: unknown
): FailureResult => ({
  error: {
    code,
    message,
    actualError: error,
  },
});

export const success = <T>(data: T): SuccessResult<T> => ({ data });
