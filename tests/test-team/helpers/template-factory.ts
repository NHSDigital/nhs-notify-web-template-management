import { Template, TemplateType } from './types';

type BaseTemplateFields = Omit<
  Template,
  'version' | '__typename' | 'createdAt' | 'updatedAt'
>;

export const TemplateFactory = {
  createEmailTemplate: (props: Omit<BaseTemplateFields, 'type'>): Template => {
    return {
      ...props,
      __typename: 'TemplateStorage',
      type: TemplateType.EMAIL,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
  },

  create: (props: BaseTemplateFields): Template => {
    return {
      ...props,
      __typename: 'TemplateStorage',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
  },
};
