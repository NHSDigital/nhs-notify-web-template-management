/* eslint-disable no-underscore-dangle */
import { Logger } from 'winston';
import { Session } from '@domain/session/session';
import { getSessionClient } from '@utils/amplify-utils';
import { logger } from '@utils/logger';
import {
  ISessionRepository,
  AmplifySessionRepository,
} from './session-repository';

export class SessionService {
  constructor(
    private readonly _repo: ISessionRepository,
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
    const session = await this._repo.get(sessionId);

    this._logger.debug('Found session', {
      sessionId: session.id,
    });

    return session;
  }

  async updateSession(session: Session) {
    const updatedSession = await this._repo.update(session);

    this._logger.debug('Updated session', {
      sessionId: updatedSession.id,
    });

    return updatedSession;
  }

  static init() {
    return new SessionService(
      new AmplifySessionRepository(getSessionClient()),
      logger
    );
  }
}
