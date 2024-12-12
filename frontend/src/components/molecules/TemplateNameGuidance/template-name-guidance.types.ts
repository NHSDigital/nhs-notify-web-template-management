import { TemplateType } from 'nhs-notify-web-template-management-utils';

export type TemplateNameGuidanceType = {
  template: keyof typeof TemplateType;
};
