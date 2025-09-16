import {
  type EmailTemplate,
  templateTypeDisplayMappings,
} from 'nhs-notify-web-template-management-utils';
import {
  ContentPreview,
  DetailSection,
  DetailsHeader,
  StandardDetailRows,
} from './common';
import { Container } from 'nhsuk-react-components';
import concatClassNames from '@utils/concat-class-names';

export default function PreviewTemplateDetailsEmail({
  template,
  subject,
  message,
  caption,
}: {
  template: EmailTemplate;
  subject: string;
  message: string;
  caption?: string;
}) {
  return (
    <>
      <DetailsHeader templateName={template.name} caption={caption} />
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
            fields={[
              { heading: 'Subject', id: 'subject', value: subject },
              { heading: 'Message', id: 'message', value: message },
            ]}
          />
        </DetailSection>
      </Container>
    </>
  );
}
