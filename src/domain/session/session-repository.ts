import { DbOperationError } from '@domain/errors';
import { Session } from '@domain/session/session';
import { getSessionClient, SessionClient } from '@utils/amplify-utils';

export class SessionRepository {
  constructor(private readonly _client: SessionClient) {}

  async create() {
    const response = await this._client.create({
      templateType: 'UNKNOWN',
    });

    const data = this._processAmplifyResponse('create', response);

    return Session.create({
      id: data.id,
      templateType: data.templateType!,
      nhsAppTemplateName: String(data.nhsAppTemplateName),
      nhsAppTemplateMessage: String(data.nhsAppTemplateMessage),
    });
  }

  async get(sessionId: string) {
    const response = await this._client.get({
      id: sessionId,
    });

    return Session.create({
      id: response.id,
      templateType: response.templateType!,
      nhsAppTemplateName: String(response.nhsAppTemplateName),
      nhsAppTemplateMessage: String(response.nhsAppTemplateMessage),
    });
  }

  async update(session: Session) {
    const { data, errors } = await this._client.update({
      id: session.id,
      templateType: session.templateType,
      nhsAppTemplateName: session.nhsAppTemplateName,
      nhsAppTemplateMessage: session.nhsAppTemplateMessage,
    });
  }

  private _processAmplifyResponse(
    operation: 'create' | 'update',
    {
      data,
      error,
    }: { data?: ReturnType<SessionClient['create']>; error?: unknown }
  ) {
    if (error) {
      throw new DbOperationError({
        message: 'Session operation failed',
        cause: error,
        operation,
      });
    }

    if (!data) {
      throw new DbOperationError({
        message: 'Unknown state',
        operation,
      });
    }

    return data!;
  }
}

const repo = new SessionRepository(getSessionClient());
