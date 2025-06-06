import { Tag, SummaryList } from 'nhsuk-react-components';
import concatClassNames from '@utils/concat-class-names';
import {
  templateStatusToDisplayMappings,
  templateStatusToColourMappings,
} from 'nhs-notify-web-template-management-utils';
import styles from './PreviewTemplateDetails.module.scss';
import { JSX } from 'react';
import content from '@content/content';
import { TemplateDto } from 'nhs-notify-backend-client';

type ContentPreviewField = {
  heading: 'Id' | 'Heading' | 'Body text' | 'Subject' | 'Message';
  id: string;
  value: string;
};

const { rowHeadings } = content.components.previewTemplateDetails;

export function DetailSection({ children }: { children: React.ReactNode }) {
  return (
    <SummaryList
      noBorder={false}
      className={concatClassNames('nhsuk-u-margin-bottom-4', styles.preview)}
    >
      {children}
    </SummaryList>
  );
}

export function ContentPreview({
  fields,
}: Readonly<{ fields: ContentPreviewField[] }>): JSX.Element[] {
  return fields.map(({ heading, value, id }, idx) => (
    <SummaryList.Row key={id}>
      <SummaryList.Key>
        <div
          id={`preview-heading-${id}`}
          data-testid={`preview__heading-${idx}`}
        >
          {heading}
        </div>
      </SummaryList.Key>
      <SummaryList.Value>
        <div
          id={`preview-content-${id}`}
          data-testid={`preview__content-${idx}`}
          className={styles.preview__content}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      </SummaryList.Value>
    </SummaryList.Row>
  ));
}

export function StandardDetailRows({
  template,
  templateTypeText,
}: Readonly<{
  template: TemplateDto;
  templateTypeText: string;
}>): JSX.Element {
  return (
    <>
      <SummaryList.Row>
        <SummaryList.Key>{rowHeadings.templateId}</SummaryList.Key>
        <SummaryList.Value>{template.id}</SummaryList.Value>
      </SummaryList.Row>
      <SummaryList.Row>
        <SummaryList.Key>{rowHeadings.templateType}</SummaryList.Key>
        <SummaryList.Value>{templateTypeText}</SummaryList.Value>
      </SummaryList.Row>
      <SummaryList.Row>
        <SummaryList.Key>{rowHeadings.templateStatus}</SummaryList.Key>
        <SummaryList.Value>
          <Tag color={templateStatusToColourMappings(template.templateStatus)}>
            {templateStatusToDisplayMappings(template.templateStatus)}
          </Tag>
        </SummaryList.Value>
      </SummaryList.Row>
    </>
  );
}

export function DetailsHeader({
  templateName,
}: Readonly<{
  templateName: string;
}>): JSX.Element {
  return (
    <h1
      data-testid='preview-message__heading'
      className={styles.preview__heading}
    >
      {templateName}
    </h1>
  );
}
