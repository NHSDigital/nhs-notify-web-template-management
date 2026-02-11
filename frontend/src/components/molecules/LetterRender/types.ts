export type RenderTab = 'short' | 'long';

export type RenderFormData = {
  systemPersonalisationPackId: string;
  personalisationParameters: Record<string, string>;
};

export type UpdateLetterPreviewInput = {
  templateId: string;
  tab: RenderTab;
  systemPersonalisationPackId: string;
  personalisation: Record<string, string>;
};
