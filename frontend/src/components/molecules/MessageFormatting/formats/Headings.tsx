import { Details } from 'nhsuk-react-components';
import content from '@content/content';

const { headings, hiddenCodeBlockDescription } =
  content.components.messageFormatting;

export const Headings = () => (
  <Details data-testid='headings-details'>
    <Details.Summary data-testid='headings-summary'>
      {headings.title}
    </Details.Summary>
    <Details.Text data-testid='headings-text'>
      <p>{headings.text1}</p>
      <span className='nhsuk-u-visually-hidden' id='heading-description'>
        {hiddenCodeBlockDescription}
      </span>
      <code aria-describedby='heading-description'>
        {headings.codeBlock.text1}
      </code>
      <p className='nhsuk-u-margin-top-4'>{headings.text2}</p>
      <span className='nhsuk-u-visually-hidden' id='subheading-description'>
        {hiddenCodeBlockDescription}
      </span>
      <code aria-describedby='subheading-description'>
        {headings.codeBlock.text2}
      </code>
    </Details.Text>
  </Details>
);
