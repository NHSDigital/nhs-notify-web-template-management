import { Session, TemplateType } from './types';

export class SessionFactory {
  static createEmailSession(id: string) {
    return SessionFactory.create({
      id,
      templateType: TemplateType.EMAIL,
    });
  }

  static create({
    id,
    templateType,
  }: {
    id: string;
    templateType: Session['templateType'];
  }): Session {
    return {
      __typename: 'SessionStorage',
      id,
      templateType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nhsAppTemplateName: '',
      nhsAppTemplateMessage: '',
    };
  }
}
