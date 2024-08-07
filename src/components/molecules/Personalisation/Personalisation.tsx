import content from '@content/content';
import { Details } from 'nhsuk-react-components';

const personalisationContent = content.components.personalisationComponent;

export function Personalisation() {
  return (
    <>
      <h2 className='nhsuk-heading-m' data-testid='personalisation-header'>
        {personalisationContent.header}
      </h2>
      <Details data-testid='personalisation-details'>
        <Details.Summary data-testid='personalisation-summary'>
          {personalisationContent.details.title}
        </Details.Summary>
        <Details.Text data-testid='personalisation-text'>
          <p>{personalisationContent.details.text1}</p>
          <code>{personalisationContent.details.codeBlockText}</code>
          <p className='nhsuk-u-margin-top-4'>
            {personalisationContent.details.text2}
          </p>
          <p>{personalisationContent.details.text3}</p>
          <ul>
            {personalisationContent.details.list.map(({ id, item }) => (
              <li key={id}>{item}</li>
            ))}
          </ul>
        </Details.Text>
      </Details>
    </>
  );
}
