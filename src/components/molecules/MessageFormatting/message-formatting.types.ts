import { TemplateFormatText } from '@utils/types';

export type MessageFormattingType = {
  template: keyof typeof TemplateFormatText;
};
