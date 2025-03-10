import { TemplateType } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import {
  BoldText,
  BulletList,
  Headings,
  HorizontalRule,
  LineBreaksAndParagraphs,
  LinksAndUrlsMarkdown,
  LinksAndUrlsNoMarkdown,
  NumberedList,
} from './formats';
import { JSX } from 'react';

const messageFormattingContent = content.components.messageFormatting;

const messageFormattingMap: Record<TemplateType, JSX.Element[]> = {
  NHS_APP: [
    LineBreaksAndParagraphs(),
    Headings(),
    BoldText(),
    LinksAndUrlsMarkdown(),
  ],
  EMAIL: [
    LineBreaksAndParagraphs(),
    Headings(),
    BulletList(),
    NumberedList(),
    HorizontalRule(),
    LinksAndUrlsMarkdown(),
  ],
  SMS: [LinksAndUrlsNoMarkdown()],
  LETTER: [],
};

export function MessageFormatting({ template }: { template: TemplateType }) {
  return (
    <>
      <h2
        className='nhsuk-heading-m nhsuk-u-margin-top-4'
        data-testid='personalisation-header'
      >
        {messageFormattingContent.header}
      </h2>
      {...messageFormattingMap[template]}
    </>
  );
}
