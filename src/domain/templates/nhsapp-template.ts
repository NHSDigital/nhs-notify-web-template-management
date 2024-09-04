import { Session, TemplateType } from '@utils/types';
import { Template } from './template';
import { randomUUID } from 'crypto';

export class NHSAppTemplate extends Template<{ body: string }> {
  constructor(
    id: string,
    name: string,
    version: number,
    fields: { body: string }
  ) {
    super(id, name, TemplateType.NHS_APP, version, fields);
  }

  static create(session: Session) {
    return new NHSAppTemplate(
      `nhsapp-${randomUUID()}`,
      session.nhsAppTemplateName,
      1,
      {
        body: session.nhsAppTemplateMessage,
      }
    );
  }

  // TODO: also not a fan of this either...
  validate() {
    const result = super.validate();

    if (!result.valid) return result;

    if (!this.id.startsWith('nhsapp-')) {
      return {
        valid: false,
        errors: ['Template id must start with "nhsapp-"'],
      };
    }

    return { valid: true };
  }
}
