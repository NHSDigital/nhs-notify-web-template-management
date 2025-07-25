import {
  ErrorCase,
  FailureResult,
  SuccessResult,
} from 'nhs-notify-backend-client';

export type ApplicationResult<T> = SuccessResult<T> | FailureResult;

export const failure = (
  code: ErrorCase,
  description: string,
  actualError?: unknown,
  details?: Record<string, string>
): FailureResult => ({
  error: {
    errorMeta: {
      code,
      description,
      details,
    },
    actualError,
  },
});

export const success = <T>(data: T): SuccessResult<T> => ({ data });
