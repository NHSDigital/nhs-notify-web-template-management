import {
  NHSAppTemplate,
  templateTypeDisplayMappings,
} from 'nhs-notify-web-template-management-utils';
import {
  ContentPreview,
  DetailSection,
  PreviewTemplateDetailsContainer,
  StandardDetailRows,
} from './common';

export function PreviewTemplateDetailsNhsApp({
  template,
  message,
}: {
  template: NHSAppTemplate;
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
