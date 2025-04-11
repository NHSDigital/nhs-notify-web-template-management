import { Details } from 'nhsuk-react-components';
import content from '@content/content';
import styles from '../MessageFormatting.module.scss';

const { numberedLists, hiddenCodeBlockDescription } =
  content.components.messageFormatting;

export const NumberedList = () => (
  <Details data-testid='numbered-list-details'>
    <Details.Summary data-testid='numbered-list-summary'>
      {numberedLists.title}
    </Details.Summary>
    <Details.Text data-testid='numbered-list-text'>
      <p>{numberedLists.text}</p>
      <span className='nhsuk-u-visually-hidden' id='numbered-list-description'>
        {hiddenCodeBlockDescription}
      </span>
      <code aria-describedby='numbered-list-description'>
        {numberedLists.codeBlockText.map(({ id, item }) => (
          <span className={styles.inlineText} key={id}>
            {item}
          </span>
        ))}
      </code>
    </Details.Text>
  </Details>
);
