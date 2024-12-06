import { Details } from 'nhsuk-react-components';
import content from '@content/content';
import styles from '../MessageFormatting.module.scss';

const { bulletLists } = content.components.messageFormattingComponent;

export const BulletList = () => (
  <Details data-testid='bullet-lists-details'>
    <Details.Summary data-testid='bullet-lists-summary'>
      {bulletLists.title}
    </Details.Summary>
    <Details.Text data-testid='bullet-lists-text'>
      <p>{bulletLists.text}</p>
      <code>
        {bulletLists.codeBlockText.map(({ id, item }) => (
          <span className={styles.inlineText} key={id}>
            {item}
          </span>
        ))}
      </code>
    </Details.Text>
  </Details>
);
