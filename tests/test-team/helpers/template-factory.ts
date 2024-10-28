import { Template } from './types';

type BaseTemplateFields = Omit<
  Template,
  'version' | '__typename' | 'createdAt' | 'updatedAt'
>;

export const TemplateFactory = {
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
