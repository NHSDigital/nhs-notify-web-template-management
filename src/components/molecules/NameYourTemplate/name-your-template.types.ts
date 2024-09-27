import { TemplateType } from '@utils/types';

export type NameYourTemplateType = {
  template: keyof typeof TemplateType;
};
