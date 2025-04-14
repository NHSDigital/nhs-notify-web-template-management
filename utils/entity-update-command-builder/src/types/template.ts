import type {
  Language,
  LetterFiles,
  LetterType,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-backend-client';
import {
  EmailTemplate,
  LetterTemplate,
  NHSAppTemplate,
  SMSTemplate,
} from 'nhs-notify-web-template-management-utils';

export type MergedTemplate = {
  createdAt: string;
  files?: LetterFiles;
  id: string;
  language?: Language;
  letterType?: LetterType;
  message?: string;
  subject?: string;
  templateStatus: TemplateStatus;
  templateType: TemplateType;
  updatedAt: string;
  lockTime?: number;
};

type AssertExtendsMerged<T extends MergedTemplate> = T;

type _Asserted = AssertExtendsMerged<LetterTemplate> &
  AssertExtendsMerged<NHSAppTemplate> &
  AssertExtendsMerged<EmailTemplate> &
  AssertExtendsMerged<SMSTemplate>;
