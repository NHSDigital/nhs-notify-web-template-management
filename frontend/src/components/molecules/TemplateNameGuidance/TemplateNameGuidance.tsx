import content from '@content/content';
import { Details } from 'nhsuk-react-components';
import { TemplateNameGuidanceType } from './template-name-guidance.types';

export function TemplateNameGuidance({ template }: TemplateNameGuidanceType) {
  const {
    templateNameDetailsSummary,
    templateNameDetailsOpeningParagraph,
    templateNameDetailsListHeader,
    templateNameDetailsList,
    templateNameDetailsExample,
  } = content.components.nameYourTemplate;

  const templateNameDetailsExampleText = templateNameDetailsExample[template];

  return (
    <Details data-testid='how-to-name-your-template-details'>
      <Details.Summary data-testid='how-to-name-your-template-summary'>
        {templateNameDetailsSummary}
      </Details.Summary>
      <Details.Text data-testid='how-to-name-your-template-text'>
        <p>{templateNameDetailsOpeningParagraph}</p>
        <p>{templateNameDetailsListHeader}</p>
        <ul>
          {templateNameDetailsList.map((listItem) => (
            <li key={`list-item-${listItem.id}`}>{listItem.text}</li>
          ))}
        </ul>
        <p data-testid='template-name-example'>
          {templateNameDetailsExampleText}
        </p>
      </Details.Text>
    </Details>
  );
}
