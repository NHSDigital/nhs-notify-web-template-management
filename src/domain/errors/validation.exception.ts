import { SessionException } from './session.exception';

export class ValidationException extends SessionException {
  constructor({
    message,
    sessionId,
    cause,
  }: {
    message: string;
    sessionId: string;
    cause?: unknown;
  }) {
    super(message, sessionId, 'VALIDATION_FAILED');
    this.cause = cause;
    this.name = 'ValidationException';
  }
}
