import { Details } from 'nhsuk-react-components';
import content from '@content/content';
import styles from '../MessageFormatting.module.scss';
import CodeExample from '@atoms/CodeExample/CodeExample';

const { horizontalLine, hiddenCodeBlockDescription } =
  content.components.messageFormatting;

export const HorizontalRule = () => (
  <Details data-testid='horizontal-lines-details'>
    <Details.Summary data-testid='horizontal-lines-summary'>
      {horizontalLine.title}
    </Details.Summary>
    <Details.Text data-testid='horizontal-lines-text'>
      <p>{horizontalLine.text}</p>
      <CodeExample
        ariaText={hiddenCodeBlockDescription}
        ariaId='horizontal-rule-description'
        codeClassName={styles.horizontalLine}
      >
        {horizontalLine.codeBlockText.map(({ id, item }) => (
          <p key={id}>{item}</p>
        ))}
      </CodeExample>
    </Details.Text>
  </Details>
);
