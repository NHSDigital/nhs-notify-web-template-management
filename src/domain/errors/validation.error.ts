import { CodedError } from './coded.error';

export class ValidationError extends CodedError {
  constructor({ message, cause }: { message: string; cause?: unknown }) {
    super(message, 'VALIDATION_FAILED');
    this.cause = cause;
    this.name = 'ValidationError';
  }
}
