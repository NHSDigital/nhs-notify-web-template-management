export class CodedError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
  }

  static Codes = {
    internalServerError: { code: 'ERR001', message: 'Internal server error' },
  };
}
