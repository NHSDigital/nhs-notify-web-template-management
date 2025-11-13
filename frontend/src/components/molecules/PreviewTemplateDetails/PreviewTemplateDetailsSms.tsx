import {
  type SMSTemplate,
  templateTypeDisplayMappings,
} from 'nhs-notify-web-template-management-utils';
import {
  ContentPreview,
  DetailSection,
  DetailsHeader,
  LockedTemplateWarning,
  StandardDetailRows,
} from './common';
import { Container } from 'nhsuk-react-components';
import concatClassNames from '@utils/concat-class-names';

export default function PreviewTemplateDetailsSms({
  template,
  message,
}: {
  template: SMSTemplate;
  message: string;
}) {
  return (
    <>
      <DetailsHeader templateName={template.name} />

      {template.templateStatus === 'LOCKED' && (
        <LockedTemplateWarning template={template} />
      )}

      <Container
        className={concatClassNames('nhsuk-u-margin-bottom-6', 'nhsuk-body-m')}
      >
        <DetailSection>
          <StandardDetailRows
            template={template}
            templateTypeText={templateTypeDisplayMappings(
              template.templateType
            )}
          />
        </DetailSection>
        <DetailSection>
          <ContentPreview
            fields={[{ heading: 'Message', id: 'message', value: message }]}
          />
        </DetailSection>
      </Container>
    </>
  );
}
