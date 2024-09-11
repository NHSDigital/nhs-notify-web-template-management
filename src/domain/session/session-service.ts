import { Logger } from 'winston';
import { SessionRepository } from './session-repository';
import { Session } from '@domain/session/session';
import { getSessionClient } from '@utils/amplify-utils';
import { logger } from '@utils/logger';

export class SessionService {
  constructor(
    private readonly _repo: SessionRepository,
    private readonly _logger: Logger
  ) {}

  async beginSession() {
    const session = await this._repo.create();

    this._logger.info('Created new session', {
      sessionId: session.id,
    });

    return session;
  }

  async findSession(sessionId: string) {
    return await this._repo.get(sessionId);
  }

  async updateSession(session: Session) {
    await this._repo.update(session);
  }

  async endSession(sessionId: string) {
    throw new Error('not Implemented');
  }

  static init() {
    return new SessionService(
      new SessionRepository(getSessionClient()),
      logger
    );
  }
}
