import type {
  Language,
  LetterType,
} from 'nhs-notify-web-template-management-types';

export type ExpandedIdComponents = {
  clientId: string;
  templateId: string;
  campaignId: string;
  language: Language;
  letterType: LetterType;
};
