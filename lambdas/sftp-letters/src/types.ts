import { Language, LetterType } from 'nhs-notify-backend-client';

export type ExpandedIdComponents = {
  clientId: string;
  templateId: string;
  campaignId: string;
  language: Language;
  letterType: LetterType;
};
