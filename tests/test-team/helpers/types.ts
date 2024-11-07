export enum TemplateType {
  NHS_APP = 'NHS_APP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  LETTER = 'LETTER',
}

export type BaseTemplateFields = {
  name: string;
  message: string;
};

export type BaseTemplateFieldsWithSubject = BaseTemplateFields & {
  subject: string;
};

export type Template = {
  __typename: string;
  createdAt: string;
  updatedAt: string;
  id: string;
  version: number;
  templateType: TemplateType | 'UNKNOWN';
  NHS_APP?: BaseTemplateFields;
  EMAIL?: BaseTemplateFieldsWithSubject;
  SMS?: BaseTemplateFields;
  LETTER?: BaseTemplateFields;
};
