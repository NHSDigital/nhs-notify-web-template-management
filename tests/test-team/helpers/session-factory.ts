import { Session, TemplateType } from './types';

export const SessionFactory = {
  createEmailSession: (id: string): Session => {
    return SessionFactory.create({
      id,
      templateType: TemplateType.EMAIL,
    });
  },

  create: ({
    id,
    templateType,
  }: {
    id: string;
    templateType: Session['templateType'];
  }): Session => {
    return {
      __typename: 'SessionStorage',
      id,
      templateType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nhsAppTemplateName: '',
      nhsAppTemplateMessage: '',
    };
  },
};
