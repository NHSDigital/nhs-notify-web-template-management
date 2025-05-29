import {
  type SMSTemplate,
  templateTypeDisplayMappings,
} from 'nhs-notify-web-template-management-utils';
import {
  ContentPreview,
  DetailSection,
  PreviewTemplateDetailsContainer,
  StandardDetailRows,
} from './common';

export default function PreviewTemplateDetailsSms({
  template,
  message,
}: {
  template: SMSTemplate;
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
          fields={[{ heading: 'Message', id: 'message', value: message }]}
        />
      </DetailSection>
    </PreviewTemplateDetailsContainer>
  );
}
