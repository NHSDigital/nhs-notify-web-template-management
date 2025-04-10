import { Details } from 'nhsuk-react-components';
import content from '@content/content';
import styles from '../MessageFormatting.module.scss';

const { lineBreaksAndParagraphs, hiddenCodeBlockDescription } =
  content.components.messageFormatting;

export const LineBreaksAndParagraphs = () => (
  <Details data-testid='lines-breaks-and-paragraphs-details'>
    <Details.Summary data-testid='lines-breaks-and-paragraphs-summary'>
      {lineBreaksAndParagraphs.title}
    </Details.Summary>
    <Details.Text data-testid='lines-breaks-and-paragraphs-text'>
      <p>{lineBreaksAndParagraphs.text1}</p>
      <span className='nhsuk-u-visually-hidden' id='linebreak-description'>
        {hiddenCodeBlockDescription}
      </span>
      <code aria-describedby='linebreak-description'>
        {lineBreaksAndParagraphs.codeBlockText.map(({ id, item }) => (
          <span className={styles.inlineText} key={id}>
            {item}&nbsp;&nbsp;
          </span>
        ))}
      </code>
      <p className='nhsuk-u-margin-top-4'>{lineBreaksAndParagraphs.text2}</p>
      <span
        className='nhsuk-u-visually-hidden'
        id='paragraph-break-description'
      >
        {hiddenCodeBlockDescription}
      </span>
      <code
        className={styles.codeLine}
        aria-describedby='paragraph-break-description'
      >
        {lineBreaksAndParagraphs.codeBlockText.map(({ id, item }) => (
          <p key={id}>{item}</p>
        ))}
      </code>
    </Details.Text>
  </Details>
);
