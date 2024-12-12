import { Details } from 'nhsuk-react-components';
import content from '@content/content';

const { boldText } = content.components.messageFormattingComponent;

export const BoldText = () => (
  <Details data-testid='bold-text-details'>
    <Details.Summary data-testid='bold-text-summary'>
      {boldText.title}
    </Details.Summary>
    <Details.Text data-testid='bold-text-text'>
      <p>{boldText.text}</p>
      <code>{boldText.codeBlockText}</code>
    </Details.Text>
  </Details>
);
