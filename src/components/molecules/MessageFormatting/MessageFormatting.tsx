import styles from './MessageFormatting.module.scss';
import { Details } from 'nhsuk-react-components';
import { MessageFormattingType } from './message-formatting.types';
import { TemplateFormatText } from '@/src/types/template-format.types';

import content from '@/src/content/content';

const messageFormattingContent = content.components.messageFormattingComponent;

export function MessageFormatting({ template }: MessageFormattingType) {
  return (
    <>
      <h2
        className='nhsuk-heading-m nhsuk-u-margin-top-4'
        data-testid='personalisation-header'
      >
        {template === TemplateFormatText.LETTER
          ? messageFormattingContent.letterHeader
          : messageFormattingContent.header}
      </h2>

      <Details data-testid='lines-breaks-and-paragraphs-details'>
        <Details.Summary data-testid='lines-breaks-and-paragraphs-summary'>
          {messageFormattingContent.lineBreaksAndParagraphs.title}
        </Details.Summary>
        <Details.Text data-testid='lines-breaks-and-paragraphs-text'>
          <p>{messageFormattingContent.lineBreaksAndParagraphs.text1}</p>
          <code>
            {messageFormattingContent.lineBreaksAndParagraphs.codeBlockText.map(
              ({ id, item }) => (
                <span className={styles.inlineText} key={id}>
                  {item}
                </span>
              )
            )}
          </code>
          <p className='nhsuk-u-margin-top-4'>
            {messageFormattingContent.lineBreaksAndParagraphs.text2}
          </p>
          <code className={styles.codeLine}>
            {messageFormattingContent.lineBreaksAndParagraphs.codeBlockText.map(
              ({ id, item }) => (
                <p key={id}>{item}</p>
              )
            )}
          </code>
        </Details.Text>
      </Details>
      <Details data-testid='link-and-url-details'>
        <Details.Summary data-testid='link-and-url-summary'>
          {messageFormattingContent.linksAndUrls.title}
        </Details.Summary>
        <Details.Text data-testid='link-and-url-text'>
          <p>{messageFormattingContent.linksAndUrls.text1}</p>
          <p>{messageFormattingContent.linksAndUrls.text2}</p>
          <code>
            {messageFormattingContent.linksAndUrls.codeBlockText.text1}
          </code>
          <p className='nhsuk-u-margin-top-4'>
            {messageFormattingContent.linksAndUrls.text3}
          </p>
          <p>{messageFormattingContent.linksAndUrls.text4}</p>
          <code>
            {messageFormattingContent.linksAndUrls.codeBlockText.text2}
          </code>
        </Details.Text>
      </Details>
      {template !== TemplateFormatText.SMS ? (
        <Details data-testid='bold-text-details'>
          <Details.Summary data-testid='bold-text-summary'>
            {messageFormattingContent.boldText.title}
          </Details.Summary>
          <Details.Text data-testid='bold-text-text'>
            <p>{messageFormattingContent.boldText.text}</p>
            <code>{messageFormattingContent.boldText.codeBlockText}</code>
          </Details.Text>
        </Details>
      ) : null}
      {template === TemplateFormatText.EMAIL ||
      template === TemplateFormatText.LETTER ? (
        <Details data-testid='headings-details'>
          <Details.Summary data-testid='headings-summary'>
            {messageFormattingContent.headings.title}
          </Details.Summary>
          <Details.Text data-testid='headings-text'>
            <p>{messageFormattingContent.headings.text1}</p>
            <code>{messageFormattingContent.headings.codeBlock.text1}</code>
            <p>{messageFormattingContent.headings.text2}</p>
            <code>{messageFormattingContent.headings.codeBlock.text2}</code>
          </Details.Text>
        </Details>
      ) : null}
      {template === TemplateFormatText.EMAIL ||
      template === TemplateFormatText.LETTER ? (
        <Details data-testid='bullet-lists-details'>
          <Details.Summary data-testid='bullet-lists-summary'>
            {messageFormattingContent.bulletLists.title}
          </Details.Summary>
          <Details.Text data-testid='bullet-lists-text'>
            <p>{messageFormattingContent.bulletLists.text}</p>
            <code>
              {messageFormattingContent.bulletLists.codeBlockText.map(
                ({ id, item }) => (
                  <span className={styles.inlineText} key={id}>
                    {item}
                  </span>
                )
              )}
            </code>
          </Details.Text>
        </Details>
      ) : null}
      {template === TemplateFormatText.EMAIL ||
      template === TemplateFormatText.LETTER ? (
        <Details data-testid='numbered-list-details'>
          <Details.Summary data-testid='numbered-list-summary'>
            {messageFormattingContent.numberedLists.title}
          </Details.Summary>
          <Details.Text data-testid='numbered-list-text'>
            <p>{messageFormattingContent.numberedLists.text}</p>
            <code>
              {messageFormattingContent.numberedLists.codeBlockText.map(
                ({ id, item }) => (
                  <span className={styles.inlineText} key={id}>
                    {item}
                  </span>
                )
              )}
            </code>
          </Details.Text>
        </Details>
      ) : null}
      {template === TemplateFormatText.EMAIL ||
      template === TemplateFormatText.LETTER ? (
        <Details data-testid='signatures-details'>
          <Details.Summary data-testid='signatures-summary'>
            {messageFormattingContent.signatures.title}
          </Details.Summary>
          <Details.Text data-testid='signatures-text'>
            <p>{messageFormattingContent.signatures.text}</p>
            <code>{messageFormattingContent.signatures.codeBlockText}</code>
          </Details.Text>
        </Details>
      ) : null}
      {template === TemplateFormatText.EMAIL ||
      template === TemplateFormatText.LETTER ? (
        <Details data-testid='horizontal-lines-details'>
          <Details.Summary data-testid='horizontal-lines-summary'>
            {messageFormattingContent.horizontalLine.title}
          </Details.Summary>
          <Details.Text data-testid='horizontal-lines-text'>
            <p>{messageFormattingContent.horizontalLine.text}</p>
            <code className={styles.horizontalLine}>
              {messageFormattingContent.horizontalLine.codeBlockText.map(
                ({ id, item }) => (
                  <p key={id}>{item}</p>
                )
              )}
            </code>
          </Details.Text>
        </Details>
      ) : null}
      {template === TemplateFormatText.LETTER ? (
        <Details data-testid='page-breaks-details'>
          <Details.Summary data-testid='page-breaks-summary'>
            {messageFormattingContent.pageBreaks.title}
          </Details.Summary>
          <Details.Text data-testid='page-breaks-text'>
            <p>{messageFormattingContent.pageBreaks.text}</p>
            <code>
              {messageFormattingContent.pageBreaks.codeBlockText.map(
                ({ id, item }) => (
                  <span className={styles.inlineText} key={id}>
                    {item}
                  </span>
                )
              )}
            </code>
          </Details.Text>
        </Details>
      ) : null}
      {template === TemplateFormatText.LETTER ? (
        <Details data-testid='content-blocks-details'>
          <Details.Summary data-testid='content-blocks-summary'>
            {messageFormattingContent.contentBlocks.title}
          </Details.Summary>
          <Details.Text data-testid='content-blocks-text'>
            <p>{messageFormattingContent.contentBlocks.text1}</p>
            <p>{messageFormattingContent.contentBlocks.text2}</p>
            <p>{messageFormattingContent.contentBlocks.text3}</p>
            <code>
              {messageFormattingContent.contentBlocks.codeBlockText.map(
                ({ id, item }) => (
                  <span className={styles.inlineText} key={id}>
                    {item}
                  </span>
                )
              )}
            </code>
          </Details.Text>
        </Details>
      ) : null}
    </>
  );
}
