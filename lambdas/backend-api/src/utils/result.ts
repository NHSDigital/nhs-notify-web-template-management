import {
  ErrorCase,
  FailureResult,
  SuccessResult,
} from 'nhs-notify-backend-client';

type FailureResultWithError = FailureResult & {
  error: {
    actualError?: unknown;
  };
};

export type ApplicationResult<T> = SuccessResult<T> | FailureResultWithError;

export const failure = (
  code: ErrorCase,
  message: string,
  actualError?: unknown,
  details?: Record<string, string>
): FailureResultWithError => ({
  error: {
    code,
    message,
    actualError,
    details,
  },
});

export const success = <T>(data: T): SuccessResult<T> => ({ data });
