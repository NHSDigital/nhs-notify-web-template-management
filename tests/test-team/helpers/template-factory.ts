import { Template, TemplateStatus, TemplateType } from './types';

export const TemplateFactory = {
  createEmailTemplate: (id: string): Template => {
    return TemplateFactory.create({
      id,
      templateType: TemplateType.EMAIL,
      subject: '',
    });
  },

  createSmsTemplate: (id: string): Template => {
    return TemplateFactory.create({
      id,
      templateType: TemplateType.SMS,
    });
  },

  createNhsAppTemplate: (id: string): Template => {
    return TemplateFactory.create({
      id,
      templateType: TemplateType.NHS_APP,
    });
  },

  create: (
    template: Partial<Template> & {
      id: string;
      templateType: string;
    }
  ): Template => {
    return {
      __typename: 'TemplateStorage',
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: '',
      message: '',
      ...template,
    };
  },
};
