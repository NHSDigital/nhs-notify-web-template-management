import { TemplateType } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import {
  BoldText,
  BulletList,
  ContentBlock,
  Headings,
  HorizontalRule,
  LineBreaksAndParagraphs,
  LinksAndUrlsMarkdown,
  LinksAndUrlsNoMarkdown,
  NumberedList,
  PageBreak,
  Signature,
} from './formats';

const messageFormattingContent = content.components.messageFormattingComponent;

const messageFormattingMap: Record<TemplateType, JSX.Element[]> = {
  [TemplateType.NHS_APP]: [
    LineBreaksAndParagraphs(),
    Headings(),
    BoldText(),
    LinksAndUrlsMarkdown(),
  ],
  [TemplateType.EMAIL]: [
    LineBreaksAndParagraphs(),
    Headings(),
    BulletList(),
    NumberedList(),
    HorizontalRule(),
    LinksAndUrlsMarkdown(),
  ],
  [TemplateType.LETTER]: [
    LineBreaksAndParagraphs(),
    Headings(),
    BoldText(),
    BulletList(),
    NumberedList(),
    Signature(),
    PageBreak(),
    ContentBlock(),
  ],
  [TemplateType.SMS]: [LinksAndUrlsNoMarkdown()],
};

export function MessageFormatting({ template }: { template: TemplateType }) {
  return (
    <>
      <h2
        className='nhsuk-heading-m nhsuk-u-margin-top-4'
        data-testid='personalisation-header'
      >
        {template === TemplateType.LETTER
          ? messageFormattingContent.letterHeader
          : messageFormattingContent.header}
      </h2>
      {...messageFormattingMap[template]}
    </>
  );
}
