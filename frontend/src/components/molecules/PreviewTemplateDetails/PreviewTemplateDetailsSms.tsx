'use client';

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
import { renderSMSMarkdown } from '@utils/markdownit';
import { useFeatureFlags } from '@providers/client-config-provider';

export default function PreviewTemplateDetailsSms({
  template,
  hideStatus,
}: {
  template: SMSTemplate;
  hideStatus?: boolean;
}) {
  const features = useFeatureFlags();
  const message = renderSMSMarkdown(template.message);

  return (
    <>
      <DetailsHeader templateName={template.name} />

      {features.routing && template.templateStatus === 'SUBMITTED' && (
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
            hideStatus={hideStatus}
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
