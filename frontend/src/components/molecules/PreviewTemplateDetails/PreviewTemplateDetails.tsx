import { Container, Tag, SummaryList } from 'nhsuk-react-components';
import concatClassNames from '@utils/concat-class-names';
import {
  letterTypeDisplayMappings,
  type EmailTemplate,
  type LetterTemplate,
  type SMSTemplate,
  NHSAppTemplate,
  templateStatusToDisplayMappings,
  templateTypeDisplayMappings,
  templateStatusToColourMappings,
} from 'nhs-notify-web-template-management-utils';
import styles from './PreviewTemplateDetails.module.scss';
import { PreviewTemplateDetailsProps } from './preview-template-details.types';
import { JSX } from 'react';
import { Filename } from '@atoms/Filename/Filename';
import content from '@content/content';

export function PreviewTemplateDetails({
  template,
  templateTypeText,
  additionalMetaFields,
  contentPreview,
}: Readonly<PreviewTemplateDetailsProps>): JSX.Element {
  const { rowHeadings } = content.components.previewTemplateDetails;

  return (
    <>
      <h1
        data-testid='preview-message__heading'
        className={styles.preview__heading}
      >
        {template.name}
      </h1>
      <Container
        className={concatClassNames('nhsuk-u-margin-bottom-6', 'nhsuk-body-m')}
      >
        <SummaryList
          noBorder={false}
          className={concatClassNames(
            'nhsuk-u-margin-bottom-4',
            styles.preview
          )}
        >
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
              <Tag
                color={templateStatusToColourMappings(template.templateStatus)}
              >
                {templateStatusToDisplayMappings(template.templateStatus)}
              </Tag>
            </SummaryList.Value>
          </SummaryList.Row>
          {additionalMetaFields?.map((row) => (
            <SummaryList.Row key={row.id}>
              <SummaryList.Key>{row.title}</SummaryList.Key>
              <SummaryList.Value>{row.content}</SummaryList.Value>
            </SummaryList.Row>
          ))}
        </SummaryList>

        {contentPreview ? (
          <SummaryList noBorder={false} className={styles.preview}>
            {contentPreview.map(({ heading, value, id }, idx) => (
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
            ))}
          </SummaryList>
        ) : null}
      </Container>
    </>
  );
}

PreviewTemplateDetails.Email = ({
  template,
  subject,
  message,
}: {
  template: EmailTemplate;
  subject: string;
  message: string;
}) => (
  <PreviewTemplateDetails
    template={template}
    templateTypeText={templateTypeDisplayMappings(template.templateType)}
    additionalMetaFields={[]}
    contentPreview={[
      { heading: 'Subject', id: 'subject', value: subject },
      { heading: 'Message', id: 'message', value: message },
    ]}
  />
);

PreviewTemplateDetails.NHSApp = ({
  template,
  message,
}: {
  template: NHSAppTemplate;
  message: string;
}) => (
  <PreviewTemplateDetails
    template={template}
    templateTypeText={templateTypeDisplayMappings(template.templateType)}
    contentPreview={[{ heading: 'Message', id: 'message', value: message }]}
  />
);

PreviewTemplateDetails.Sms = ({
  template,
  message,
}: {
  template: SMSTemplate;
  message: string;
}) => (
  <PreviewTemplateDetails
    template={template}
    templateTypeText={templateTypeDisplayMappings(template.templateType)}
    contentPreview={[{ heading: 'Message', id: 'message', value: message }]}
  />
);

PreviewTemplateDetails.Letter = ({
  template,
}: {
  template: LetterTemplate;
}) => (
  <PreviewTemplateDetails
    template={template}
    templateTypeText={letterTypeDisplayMappings(
      template.letterType,
      template.language
    )}
    additionalMetaFields={[
      {
        title: 'Template file',
        id: 'templatefile',
        content: <Filename filename={template.files.pdfTemplate.fileName} />,
      },
      ...(template.files.testDataCsv
        ? [
            {
              title: 'Test personalisation file',
              id: 'testdatafile',
              content: (
                <Filename filename={template.files.testDataCsv.fileName} />
              ),
            },
          ]
        : []),
    ]}
  />
);
