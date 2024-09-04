export class SessionException extends Error {
  constructor(
    message: string,
    public readonly sessionId: string,
    public readonly code: string
  ) {
    super(message);
  }
}
