import { TemplateFormatText } from '@/src/types/template-format.types';

export type MessageFormattingType = {
  template: keyof typeof TemplateFormatText;
};
