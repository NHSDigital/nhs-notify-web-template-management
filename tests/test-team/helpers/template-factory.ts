import { Template, TemplateType } from './types';

export const TemplateFactory = {
  createEmailTemplate: (id: string): Template => {
    return TemplateFactory.create({
      id,
      templateType: TemplateType.EMAIL,
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
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...template,
    };
  },
};
