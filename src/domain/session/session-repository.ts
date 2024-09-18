/* eslint-disable no-underscore-dangle */
import { DbOperationError } from '@domain/errors';
import { Session } from '@domain/session/session';
import { SessionClient } from '@utils/amplify-utils';
import { AsyncReturnType } from '@utils/types';

export interface ISessionRepository {
  create(): Promise<Session>;
  get(sessionId: string): Promise<Session>;
  update(session: SessionData): Promise<Session>;
}

export class AmplifySessionRepository implements ISessionRepository {
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

    const data = this._processAmplifyResponse('get', response);

    return Session.create({
      id: data.id,
      templateType: data.templateType!,
      nhsAppTemplateName: String(data.nhsAppTemplateName),
      nhsAppTemplateMessage: String(data.nhsAppTemplateMessage),
    });
  }

  async update(session: Session) {
    const response = await this._client.update({
      ...session.toPrimitive(),
    });

    const data = this._processAmplifyResponse('update', response);

    return Session.create({
      id: data.id,
      templateType: data.templateType!,
      nhsAppTemplateName: String(data.nhsAppTemplateName),
      nhsAppTemplateMessage: String(data.nhsAppTemplateMessage),
      smsTemplateName: String(data.smsTemplateName),
      smsTemplateMessage: String(data.smsTemplateMessage),
    });
  }

  // TODO: fix this.
  // eslint-disable-next-line class-methods-use-this
  private _processAmplifyResponse(
    operation: 'create' | 'update' | 'get',
    { data, errors }: AsyncReturnType<SessionClient['create']>
  ) {
    if (errors) {
      throw new DbOperationError({
        message: 'Session operation failed',
        cause: errors,
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
