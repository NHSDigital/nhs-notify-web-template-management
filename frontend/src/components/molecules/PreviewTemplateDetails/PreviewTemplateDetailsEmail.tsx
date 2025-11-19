'use client';

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
import { renderEmailMarkdown } from '@utils/markdownit';

export default function PreviewTemplateDetailsEmail({
  template,
  hideStatus,
}: {
  template: EmailTemplate;
  hideStatus?: boolean;
}) {
  const subject = template.subject;
  const message = renderEmailMarkdown(template.message);

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
            hideStatus={hideStatus}
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
