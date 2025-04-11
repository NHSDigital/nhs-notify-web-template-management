import { Details } from 'nhsuk-react-components';
import content from '@content/content';
import styles from '../MessageFormatting.module.scss';

const { horizontalLine, hiddenCodeBlockDescription } =
  content.components.messageFormatting;

export const HorizontalRule = () => (
  <Details data-testid='horizontal-lines-details'>
    <Details.Summary data-testid='horizontal-lines-summary'>
      {horizontalLine.title}
    </Details.Summary>
    <Details.Text data-testid='horizontal-lines-text'>
      <p>{horizontalLine.text}</p>
      <span
        className='nhsuk-u-visually-hidden'
        id='horizontal-rule-description'
      >
        {hiddenCodeBlockDescription}
      </span>
      <code
        className={styles.horizontalLine}
        aria-describedby='horizontal-rule-description'
      >
        {horizontalLine.codeBlockText.map(({ id, item }) => (
          <p key={id}>{item}</p>
        ))}
      </code>
    </Details.Text>
  </Details>
);
