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
import {
  ContentPreviewField,
  PreviewTemplateDetailsProps,
} from './preview-template-details.types';
import { JSX } from 'react';
import { Filename } from '@atoms/Filename/Filename';
import content from '@content/content';
import { TemplateDto } from 'nhs-notify-backend-client';

function ContentPreview({
  fields,
}: Readonly<{ fields: ContentPreviewField[] }>): JSX.Element {
  return (
    <SummaryList noBorder={false} className={styles.preview}>
      {fields.map(({ heading, value, id }, idx) => (
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
  );
}

function StandardDetailRows({
  template,
  templateTypeText,
}: Readonly<{
  template: TemplateDto;
  templateTypeText: string;
}>): JSX.Element {
  const { rowHeadings } = content.components.previewTemplateDetails;

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

export function PreviewTemplateDetails({
  template,
  children,
}: Readonly<PreviewTemplateDetailsProps>): JSX.Element {
  console.log(template);

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
        {children}
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
  <PreviewTemplateDetails template={template}>
    <SummaryList
      noBorder={false}
      className={concatClassNames('nhsuk-u-margin-bottom-4', styles.preview)}
    >
      <StandardDetailRows
        template={template}
        templateTypeText={templateTypeDisplayMappings(template.templateType)}
      />
    </SummaryList>
    <ContentPreview
      fields={[
        { heading: 'Subject', id: 'subject', value: subject },
        { heading: 'Message', id: 'message', value: message },
      ]}
    />
  </PreviewTemplateDetails>
);

PreviewTemplateDetails.NHSApp = ({
  template,
  message,
}: {
  template: NHSAppTemplate;
  message: string;
}) => (
  <PreviewTemplateDetails template={template}>
    <SummaryList
      noBorder={false}
      className={concatClassNames('nhsuk-u-margin-bottom-4', styles.preview)}
    >
      <StandardDetailRows
        template={template}
        templateTypeText={templateTypeDisplayMappings(template.templateType)}
      />
    </SummaryList>
    <ContentPreview
      fields={[{ heading: 'Message', id: 'message', value: message }]}
    />
  </PreviewTemplateDetails>
);

PreviewTemplateDetails.Sms = ({
  template,
  message,
}: {
  template: SMSTemplate;
  message: string;
}) => (
  <PreviewTemplateDetails template={template}>
    <SummaryList
      noBorder={false}
      className={concatClassNames('nhsuk-u-margin-bottom-4', styles.preview)}
    >
      <StandardDetailRows
        template={template}
        templateTypeText={templateTypeDisplayMappings(template.templateType)}
      />
    </SummaryList>
    <ContentPreview
      fields={[{ heading: 'Message', id: 'message', value: message }]}
    />
  </PreviewTemplateDetails>
);

PreviewTemplateDetails.Letter = ({
  template,
}: {
  template: LetterTemplate;
}) => (
  <PreviewTemplateDetails template={template}>
    <SummaryList
      noBorder={false}
      className={concatClassNames('nhsuk-u-margin-bottom-4', styles.preview)}
    >
      <StandardDetailRows
        template={template}
        templateTypeText={letterTypeDisplayMappings(
          template.letterType,
          template.language
        )}
      />
      <SummaryList.Row>
        <SummaryList.Key>Template file</SummaryList.Key>
        <SummaryList.Value>
          <Filename filename={template.files.pdfTemplate.fileName} />
        </SummaryList.Value>
      </SummaryList.Row>
      {template.files.testDataCsv?.fileName && (
        <SummaryList.Row>
          <SummaryList.Key>Test personalisation file</SummaryList.Key>
          <SummaryList.Value>
            <Filename filename={template.files.testDataCsv.fileName} />
          </SummaryList.Value>
        </SummaryList.Row>
      )}
    </SummaryList>

    {(template.templateStatus === 'PROOF_AVAILABLE' ||
      template.templateStatus === 'SUBMITTED') && (
      <SummaryList
        noBorder={false}
        className={concatClassNames('nhsuk-u-margin-bottom-4', styles.preview)}
      >
        <SummaryList.Row>
          <SummaryList.Key>Template proof files</SummaryList.Key>
          <SummaryList.Value>
            {Object.keys(template.files.proofs ?? {}).map((proof) => (
              <Filename key={proof} filename={`${proof}.pdf`} />
            ))}
          </SummaryList.Value>
        </SummaryList.Row>
      </SummaryList>
    )}
  </PreviewTemplateDetails>
);
