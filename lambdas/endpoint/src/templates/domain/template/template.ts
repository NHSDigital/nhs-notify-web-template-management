import { TemplateStatus, TemplateType } from 'nhs-notify-templates-client';

export type Template = {
  id: string;
  owner: string;
  version: number;
  type: TemplateType;
  status: TemplateStatus;
  name: string;
  message: string;
  subject?: string;
  createdAt: string;
  updatedAt: string;
};
