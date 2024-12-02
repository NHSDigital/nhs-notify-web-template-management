import { TemplateStatus, TemplateType } from 'nhs-notify-backend-client';

export type Template = {
  id: string;
  owner: string;
  version: number;
  templateType: TemplateType;
  templateStatus: TemplateStatus;
  name: string;
  message: string;
  subject?: string;
  createdAt: string;
  updatedAt: string;
};
