import { nameYourTemplateContent } from '@content/content';
import { Details } from 'nhsuk-react-components';

export function NameYourTemplate() {
  const {
    templateNameDetailsSummary,
    templateNameDetailsOpeningParagraph,
    templateNameDetailsListHeader,
    templateNameDetailsList,
    templateNameDetailsExample,
  } = nameYourTemplateContent;

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
        <p>{templateNameDetailsExample}</p>
      </Details.Text>
    </Details>
  );
}
