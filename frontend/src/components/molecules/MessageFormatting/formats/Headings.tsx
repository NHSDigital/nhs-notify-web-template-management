import { Details } from 'nhsuk-react-components';
import content from '@content/content';
import CodeExample from '@atoms/CodeExample/CodeExample';

const { headings, hiddenCodeBlockDescription } =
  content.components.messageFormatting;

export const Headings = () => (
  <Details data-testid='headings-details'>
    <Details.Summary data-testid='headings-summary'>
      {headings.title}
    </Details.Summary>
    <Details.Text data-testid='headings-text'>
      <p>{headings.text1}</p>
      <CodeExample
        ariaText={hiddenCodeBlockDescription}
        ariaId='heading-description'
      >
        {headings.codeBlock.text1}
      </CodeExample>
      <p className='nhsuk-u-margin-top-4'>{headings.text2}</p>
      <CodeExample
        ariaText={hiddenCodeBlockDescription}
        ariaId='subheading-description'
      >
        {headings.codeBlock.text2}
      </CodeExample>
    </Details.Text>
  </Details>
);
