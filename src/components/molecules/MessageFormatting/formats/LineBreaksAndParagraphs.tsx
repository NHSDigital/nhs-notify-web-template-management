import { Details } from 'nhsuk-react-components';
import content from '@content/content';
import styles from '../MessageFormatting.module.scss';

const { lineBreaksAndParagraphs } =
  content.components.messageFormattingComponent;

export const LineBreaksAndParagraphs = () => (
  <Details data-testid='lines-breaks-and-paragraphs-details'>
    <Details.Summary data-testid='lines-breaks-and-paragraphs-summary'>
      {lineBreaksAndParagraphs.title}
    </Details.Summary>
    <Details.Text data-testid='lines-breaks-and-paragraphs-text'>
      <p>{lineBreaksAndParagraphs.text1}</p>
      <code>
        {lineBreaksAndParagraphs.codeBlockText.map(({ id, item }) => (
          <span className={styles.inlineText} key={id}>
            {item}
          </span>
        ))}
      </code>
      <p className='nhsuk-u-margin-top-4'>{lineBreaksAndParagraphs.text2}</p>
      <code className={styles.codeLine}>
        {lineBreaksAndParagraphs.codeBlockText.map(({ id, item }) => (
          <p key={id}>{item}</p>
        ))}
      </code>
    </Details.Text>
  </Details>
);
