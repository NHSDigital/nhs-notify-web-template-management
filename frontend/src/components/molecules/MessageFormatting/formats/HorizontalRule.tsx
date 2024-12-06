import { Details } from 'nhsuk-react-components';
import content from '@content/content';
import styles from '../MessageFormatting.module.scss';

const { horizontalLine } = content.components.messageFormattingComponent;

export const HorizontalRule = () => (
  <Details data-testid='horizontal-lines-details'>
    <Details.Summary data-testid='horizontal-lines-summary'>
      {horizontalLine.title}
    </Details.Summary>
    <Details.Text data-testid='horizontal-lines-text'>
      <p>{horizontalLine.text}</p>
      <code className={styles.horizontalLine}>
        {horizontalLine.codeBlockText.map(({ id, item }) => (
          <p key={id}>{item}</p>
        ))}
      </code>
    </Details.Text>
  </Details>
);
