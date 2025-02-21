import { Details } from 'nhsuk-react-components';
import content from '@content/content';

const { headings } = content.components.messageFormatting;

export const Headings = () => (
  <Details data-testid='headings-details'>
    <Details.Summary data-testid='headings-summary'>
      {headings.title}
    </Details.Summary>
    <Details.Text data-testid='headings-text'>
      <p>{headings.text1}</p>
      <code>{headings.codeBlock.text1}</code>
      <p>{headings.text2}</p>
      <code>{headings.codeBlock.text2}</code>
    </Details.Text>
  </Details>
);
