import { TemplateType } from '@utils/enum';

export type TemplateNameGuidanceType = {
  template: keyof typeof TemplateType;
};
