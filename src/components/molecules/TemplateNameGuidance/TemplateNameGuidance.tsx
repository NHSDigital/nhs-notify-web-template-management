import { nameYourTemplateContent } from '@content/content';
import { Details } from 'nhsuk-react-components';
import { TemplateNameGuidanceType } from './template-name-guidance.types';

export function TemplateNameGuidance({ template }: TemplateNameGuidanceType) {
  const {
    templateNameDetailsSummary,
    templateNameDetailsOpeningParagraph,
    templateNameDetailsListHeader,
    templateNameDetailsList,
    templateNameDetailsExample,
  } = nameYourTemplateContent;

  const templateNameDetailsExampleText = templateNameDetailsExample[template];

  return (
    <Details>
      <Details.Summary>{templateNameDetailsSummary}</Details.Summary>
      <Details.Text>
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
