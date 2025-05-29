import {
  type EmailTemplate,
  templateTypeDisplayMappings,
} from 'nhs-notify-web-template-management-utils';
import {
  ContentPreview,
  DetailSection,
  PreviewTemplateDetailsContainer,
  StandardDetailRows,
} from './common';

export default function PreviewTemplateDetailsEmail({
  template,
  subject,
  message,
}: {
  template: EmailTemplate;
  subject: string;
  message: string;
}) {
  return (
    <PreviewTemplateDetailsContainer template={template}>
      <DetailSection>
        <StandardDetailRows
          template={template}
          templateTypeText={templateTypeDisplayMappings(template.templateType)}
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
    </PreviewTemplateDetailsContainer>
  );
}
