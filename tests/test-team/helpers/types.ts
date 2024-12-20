export enum TemplateType {
  NHS_APP = 'NHS_APP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}

export enum TemplateStatus {
  NOT_YET_SUBMITTED = 'NOT_YET_SUBMITTED',
  SUBMITTED = 'SUBMITTED',
}

export type Template = {
  createdAt: string;
  updatedAt: string;
  id: string;
  version: number;
  name: string;
  message: string;
  subject?: string;
  templateType: TemplateType;
  templateStatus: TemplateStatus;
  owner: string;
};
