import content from '@content/content';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';
import { toKebabCase } from '@utils/kebab-case';
import { Details } from 'nhsuk-react-components';

const personalisationContent = content.components.personalisation;

export function Personalisation() {
  return (
    <>
      <h2 className='nhsuk-heading-m' data-testid='personalisation-header'>
        {personalisationContent.header}
      </h2>

      <ContentRenderer content={personalisationContent.leadParagraph}/>

      {personalisationContent.details.map((section) => {
        const id = toKebabCase(section.title);
        return (
        <Details key={id} data-testid={`${id}-details`}>
          <Details.Summary data-testid={`${id}-summary`}>
            {section.title}
          </Details.Summary>
          <Details.Text data-testid={`${id}-text`}>
            <ContentRenderer
              content={section.content}
            />
          </Details.Text>
        </Details>
      )})}
    </>
  );
}
