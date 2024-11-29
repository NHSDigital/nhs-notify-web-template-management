export enum TemplateType {
  NHS_APP = 'NHS_APP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  LETTER = 'LETTER',
}

export enum TemplateStatus {
  NOT_YET_SUBMITTED = 'NOT_YET_SUBMITTED',
  SUBMITTED = 'SUBMITTED',
}

export type TemplateDTO = {
  id: string;
  type: TemplateType;
  status: TemplateStatus;
  name: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  subject?: string;
};

export type CreateTemplateInput = Omit<
  TemplateDTO,
  'id' | 'version' | 'status' | 'updatedAt' | 'createdAt'
>;

export type UpdateTemplateInput = Omit<
  TemplateDTO,
  'version' | 'type' | 'updatedAt' | 'createdAt'
>;
