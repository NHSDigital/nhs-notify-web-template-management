import { Details } from 'nhsuk-react-components';
import content from '@content/content';
import styles from '../MessageFormatting.module.scss';
import CodeExample from '@atoms/CodeExample/CodeExample';

const { lineBreaksAndParagraphs, hiddenCodeBlockDescription } =
  content.components.messageFormatting;

export const LineBreaksAndParagraphs = () => (
  <Details data-testid='lines-breaks-and-paragraphs-details'>
    <Details.Summary data-testid='lines-breaks-and-paragraphs-summary'>
      {lineBreaksAndParagraphs.title}
    </Details.Summary>
    <Details.Text data-testid='lines-breaks-and-paragraphs-text'>
      <p>{lineBreaksAndParagraphs.text1}</p>
      <CodeExample
        ariaText={hiddenCodeBlockDescription}
        ariaId='linebreak-description'
      >
        {lineBreaksAndParagraphs.codeBlockText.map(({ id, item }) => (
          <span className={styles.inlineText} key={id}>
            {item}&nbsp;&nbsp;
          </span>
        ))}
      </CodeExample>
      <p className='nhsuk-u-margin-top-4'>{lineBreaksAndParagraphs.text2}</p>
      <CodeExample
        ariaText={hiddenCodeBlockDescription}
        ariaId='paragraph-break-description'
        codeClassName={styles.codeLine}
      >
        {lineBreaksAndParagraphs.codeBlockText.map(({ id, item }) => (
          <p key={id}>{item}</p>
        ))}
      </CodeExample>
    </Details.Text>
  </Details>
);
