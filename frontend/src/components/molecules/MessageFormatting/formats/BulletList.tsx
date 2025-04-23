import { Details } from 'nhsuk-react-components';
import content from '@content/content';
import styles from '../MessageFormatting.module.scss';
import CodeExample from '@atoms/CodeExample/CodeExample';

const { bulletLists, hiddenCodeBlockDescription } =
  content.components.messageFormatting;

export const BulletList = () => (
  <Details data-testid='bullet-lists-details'>
    <Details.Summary data-testid='bullet-lists-summary'>
      {bulletLists.title}
    </Details.Summary>
    <Details.Text data-testid='bullet-lists-text'>
      <p>{bulletLists.text}</p>
      <CodeExample
        ariaText={hiddenCodeBlockDescription}
        ariaId='bullet-list-description'
      >
        {bulletLists.codeBlockText.map(({ id, item }) => (
          <span className={styles.inlineText} key={id}>
            {item}
          </span>
        ))}
      </CodeExample>
    </Details.Text>
  </Details>
);
