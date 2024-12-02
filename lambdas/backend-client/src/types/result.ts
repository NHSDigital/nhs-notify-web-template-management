import { ErrorCase } from './error-cases';

type ErrorResponse = {
  code: ErrorCase;
  message: string;
  details?: Record<string, string>;
};

export type SuccessResult<T> = { error?: never } & { data: T };

export type FailureResult = { error: ErrorResponse } & { data?: never };

export type Result<T> = SuccessResult<T> | FailureResult;
