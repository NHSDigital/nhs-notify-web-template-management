import { SessionException } from './session.exception';

export class DbOperationException extends SessionException {
  constructor({
    message,
    sessionId,
    cause,
  }: {
    message: string;
    sessionId: string;
    cause?: unknown;
  }) {
    super(message, sessionId, 'DB_OPERATION_FAILED');
    this.cause = cause;
    this.name = 'DbOperationException';
  }
}
