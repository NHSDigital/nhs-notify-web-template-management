import type {
  Language,
  LetterFiles,
  LetterType,
  TemplateStatus,
  TemplateType,
  ValidatedTemplateDto,
} from 'nhs-notify-backend-client';

export type MergedTemplateDto = {
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

type AssertExtendsMerged<T extends MergedTemplateDto> = T;
type _Asserted = AssertExtendsMerged<ValidatedTemplateDto>;
