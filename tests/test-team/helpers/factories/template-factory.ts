import { Template, TemplateStatus, TemplateType } from '../types';

export const TemplateFactory = {
  createEmailTemplate: (
    id: string,
    owner: string,
    name: string = ''
  ): Template => {
    return TemplateFactory.create({
      id,
      owner,
      name,
      templateType: TemplateType.EMAIL,
      subject: '',
    });
  },

  createSmsTemplate: (id: string, owner: string): Template => {
    return TemplateFactory.create({
      id,
      owner,
      name: '',
      templateType: TemplateType.SMS,
    });
  },

  createNhsAppTemplate: (id: string, owner: string): Template => {
    return TemplateFactory.create({
      id,
      owner,
      name: '',
      templateType: TemplateType.NHS_APP,
    });
  },

  createLetterTemplate: (id: string, owner: string): Template => {
    return TemplateFactory.create({
      id,
      owner,
      name: '',
      templateType: TemplateType.LETTER,
    });
  },

  create: (
    template: Partial<Template> & {
      id: string;
      owner: string;
      name: string;
      templateType: string;
    }
  ): Template => {
    return {
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      message: '',
      ...template,
    };
  },
};
