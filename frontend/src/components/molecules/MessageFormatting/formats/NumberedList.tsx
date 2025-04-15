import { Details } from 'nhsuk-react-components';
import content from '@content/content';
import styles from '../MessageFormatting.module.scss';
import CodeExample from '@atoms/CodeExample/CodeExample';

const { numberedLists, hiddenCodeBlockDescription } =
  content.components.messageFormatting;

export const NumberedList = () => (
  <Details data-testid='numbered-list-details'>
    <Details.Summary data-testid='numbered-list-summary'>
      {numberedLists.title}
    </Details.Summary>
    <Details.Text data-testid='numbered-list-text'>
      <p>{numberedLists.text}</p>
      <CodeExample
        ariaText={hiddenCodeBlockDescription}
        ariaId='numbered-list-description'
      >
        {numberedLists.codeBlockText.map(({ id, item }) => (
          <span className={styles.inlineText} key={id}>
            {item}
          </span>
        ))}
      </CodeExample>
    </Details.Text>
  </Details>
);
