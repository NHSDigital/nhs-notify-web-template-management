export enum TemplateType {
  NHS_APP = 'NHS_APP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  LETTER = 'LETTER',
}

export type Session = {
  id: string;
  __typename: 'SessionStorage';
  createdAt: string;
  updatedAt: string;
  templateType: TemplateType | 'UNKNOWN';
  nhsAppTemplateName: string;
  nhsAppTemplateMessage: string;
  emailTemplateName?: string;
  emailTemplateSubjectLine?: string;
  emailTemplateMessage?: string;
};
