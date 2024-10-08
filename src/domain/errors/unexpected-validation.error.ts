import { CodedError } from './coded.error';

export class UnexpectedValidationError extends CodedError {
  constructor({ message, cause }: { message: string; cause?: unknown }) {
    super(message, 'INVALID_DATA');
    this.cause = cause;
    this.name = 'UnexpectedValidationError';
  }
}
