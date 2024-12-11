import { CodedError } from './coded.error';

type Operation = 'create' | 'get' | 'update' | 'delete' | 'list';

export class DbOperationError extends CodedError {
  public readonly operation: Operation;

  constructor({
    message,
    cause,
    operation,
  }: {
    message: string;
    operation: Operation;
    cause?: unknown;
  }) {
    super(message, 'DB_OPERATION_FAILED');
    this.name = 'DbOperationError';
    this.cause = cause;
    this.operation = operation;
  }
}
