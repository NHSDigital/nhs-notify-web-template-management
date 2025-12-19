import { Tag, SummaryList } from 'nhsuk-react-components';
import concatClassNames from '@utils/concat-class-names';
import {
  statusToColourMapping,
  statusToDisplayMapping,
} from 'nhs-notify-web-template-management-utils';
import styles from './PreviewTemplateDetails.module.scss';
import { JSX } from 'react';
import content from '@content/content';
import { TemplateDto } from 'nhs-notify-backend-client';
import classNames from 'classnames';
import { toKebabCase } from '@utils/kebab-case';
import { useFeatureFlags } from '@providers/client-config-provider';

export type PreviewTemplateComponent<T extends TemplateDto> = ({
  template,
  hideStatus,
}: {
  template: T;
  hideStatus?: boolean;
}) => JSX.Element;

type ContentPreviewField = {
  heading: 'Id' | 'Heading' | 'Body text' | 'Subject' | 'Message';
  id: string;
  value: string;
};

const { rowHeadings, previewTemplateStatusFootnote, headerCaption } =
  content.components.previewTemplateDetails;

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
  campaignId,
  hideStatus,
}: Readonly<{
  template: TemplateDto;
  templateTypeText: string;
  campaignId?: string;
  hideStatus?: boolean;
}>): JSX.Element {
  const features = useFeatureFlags();
  return (
    <>
      <SummaryList.Row>
        <SummaryList.Key>{rowHeadings.templateId}</SummaryList.Key>
        <SummaryList.Value>{template.id}</SummaryList.Value>
      </SummaryList.Row>
      {campaignId && (
        <SummaryList.Row id='campaign-id'>
          <SummaryList.Key>{rowHeadings.campaignId}</SummaryList.Key>
          <SummaryList.Value>{campaignId}</SummaryList.Value>
        </SummaryList.Row>
      )}
      <SummaryList.Row>
        <SummaryList.Key>{rowHeadings.templateType}</SummaryList.Key>
        <SummaryList.Value>{templateTypeText}</SummaryList.Value>
      </SummaryList.Row>
      {!hideStatus && (
        <SummaryList.Row>
          <SummaryList.Key>{rowHeadings.templateStatus}</SummaryList.Key>
          <SummaryList.Value>
            <Tag
              data-test-id={`status-tag-${toKebabCase(template.templateStatus)}`}
              color={statusToColourMapping(template)}
            >
              {statusToDisplayMapping(template, features)}
            </Tag>
            {previewTemplateStatusFootnote[template.templateStatus] && (
              <small
                className={classNames(
                  styles.preview__statusnote,
                  'nhsuk-body-s',
                  'nhsuk-u-margin-top-2',
                  'nhsuk-u-secondary-text-color'
                )}
              >
                {previewTemplateStatusFootnote[template.templateStatus]}
              </small>
            )}
          </SummaryList.Value>
        </SummaryList.Row>
      )}
    </>
  );
}

export function DetailsHeader({
  templateName,
}: Readonly<{
  templateName: string;
}>): JSX.Element {
  return (
    <div className='nhsuk-u-reading-width'>
      <span className='nhsuk-caption-l'>{headerCaption}</span>
      <h1
        data-testid='preview-message__heading'
        className={styles.preview__heading}
      >
        {templateName}
      </h1>
    </div>
  );
}
