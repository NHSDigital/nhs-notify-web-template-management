'use client';

import {
  type SMSTemplate,
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
import { renderSMSMarkdown } from '@utils/markdownit';

export default function PreviewTemplateDetailsSms({
  template,
  excludeStatus,
}: {
  template: SMSTemplate;
  excludeStatus?: boolean;
}) {
  const message = renderSMSMarkdown(template.message);

  return (
    <>
      <DetailsHeader templateName={template.name} />
      <Container
        className={concatClassNames('nhsuk-u-margin-bottom-6', 'nhsuk-body-m')}
      >
        <DetailSection>
          <StandardDetailRows
            template={template}
            templateTypeText={templateTypeDisplayMappings(
              template.templateType
            )}
            excludeStatus={excludeStatus}
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
