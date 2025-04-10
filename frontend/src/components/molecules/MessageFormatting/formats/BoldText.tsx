import { Details } from 'nhsuk-react-components';
import content from '@content/content';

const { boldText, hiddenCodeBlockDescription } =
  content.components.messageFormatting;

export const BoldText = () => (
  <Details data-testid='bold-text-details'>
    <Details.Summary data-testid='bold-text-summary'>
      {boldText.title}
    </Details.Summary>
    <Details.Text data-testid='bold-text-text'>
      <p>{boldText.text}</p>
      <span id='bold-text-description' className='nhsuk-u-visually-hidden'>
        {hiddenCodeBlockDescription}
      </span>
      <code aria-describedby='bold-text-description'>
        {boldText.codeBlockText}
      </code>
    </Details.Text>
  </Details>
);
