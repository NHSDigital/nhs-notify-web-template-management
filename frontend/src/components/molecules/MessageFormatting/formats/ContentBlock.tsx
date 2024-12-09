import { Details } from 'nhsuk-react-components';
import content from '@content/content';
import styles from '../MessageFormatting.module.scss';

const { contentBlocks } = content.components.messageFormattingComponent;

export const ContentBlock = () => (
  <Details data-testid='content-blocks-details'>
    <Details.Summary data-testid='content-blocks-summary'>
      {contentBlocks.title}
    </Details.Summary>
    <Details.Text data-testid='content-blocks-text'>
      <p>{contentBlocks.text1}</p>
      <p>{contentBlocks.text2}</p>
      <p>{contentBlocks.text3}</p>
      <code>
        {contentBlocks.codeBlockText.map(({ id, item }) => (
          <span className={styles.inlineText} key={id}>
            {item}
          </span>
        ))}
      </code>
    </Details.Text>
  </Details>
);
