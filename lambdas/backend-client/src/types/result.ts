import { ErrorCase } from './error-cases';

type ErrorMetadata = {
  code: ErrorCase;
  description: string;
  details?: unknown;
};

export type SuccessResult<T> = { error?: never } & { data: T };

export type FailureResult = {
  error: { errorMeta: ErrorMetadata; actualError?: unknown };
} & {
  data?: never;
};

export type Result<T> = SuccessResult<T> | FailureResult;
