import { encode } from 'html-entities';
import Handlebars from 'handlebars';
import * as data from './email-template.json';

const htmlTemplate = Handlebars.compile(data.htmlContent);
const encoder = (rawText: string) => encode(rawText).replaceAll('\n', '<br />');

export const emailTemplate = (
  templateId: string,
  templateName: string,
  templateMessage: string
): string => {
  const parameters = {
    templateId,
    templateName,
    templateMessage: encoder(templateMessage),
  };
  return htmlTemplate(parameters);
};
