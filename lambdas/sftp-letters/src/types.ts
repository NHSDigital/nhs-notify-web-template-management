import { Language, LetterType } from 'nhs-notify-backend-client';

export type ExpandedIdComponenets = {
  clientId: string;
  templateId: string;
  campaignId: string;
  language: Language;
  letterType: LetterType;
};
