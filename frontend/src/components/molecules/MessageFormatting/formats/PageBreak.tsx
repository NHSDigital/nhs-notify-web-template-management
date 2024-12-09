import { Details } from 'nhsuk-react-components';
import content from '@content/content';
import styles from '../MessageFormatting.module.scss';

const { pageBreaks } = content.components.messageFormattingComponent;

export const PageBreak = () => (
  <Details data-testid='page-breaks-details'>
    <Details.Summary data-testid='page-breaks-summary'>
      {pageBreaks.title}
    </Details.Summary>
    <Details.Text data-testid='page-breaks-text'>
      <p>{pageBreaks.text}</p>
      <code>
        {pageBreaks.codeBlockText.map(({ id, item }) => (
          <span className={styles.inlineText} key={id}>
            {item}
          </span>
        ))}
      </code>
    </Details.Text>
  </Details>
);
