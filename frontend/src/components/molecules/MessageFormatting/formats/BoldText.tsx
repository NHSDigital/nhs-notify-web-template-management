import { Details } from 'nhsuk-react-components';
import content from '@content/content';
import CodeExample from '@atoms/CodeExample/CodeExample';

const { boldText, hiddenCodeBlockDescription } =
  content.components.messageFormatting;

export const BoldText = () => (
  <Details data-testid='bold-text-details'>
    <Details.Summary data-testid='bold-text-summary'>
      {boldText.title}
    </Details.Summary>
    <Details.Text data-testid='bold-text-text'>
      <p>{boldText.text}</p>
      <CodeExample
        ariaText={hiddenCodeBlockDescription}
        ariaId='bold-text-description'
      >
        {boldText.codeBlockText}
      </CodeExample>
    </Details.Text>
  </Details>
);
