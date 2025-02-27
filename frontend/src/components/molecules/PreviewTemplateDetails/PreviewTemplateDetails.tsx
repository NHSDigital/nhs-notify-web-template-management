import { Container, Row, Col, Tag } from 'nhsuk-react-components';
import concatClassNames from '@utils/concat-class-names';
import {
  letterTypeDisplayMappings,
  type EmailTemplate,
  type LetterTemplate,
  type SMSTemplate,
  NHSAppTemplate,
  TemplateStatus,
  templateStatusToDisplayMappings,
  templateTypeDisplayMappings,
} from 'nhs-notify-web-template-management-utils';
import styles from './PreviewTemplateDetails.module.scss';
import { PreviewTemplateDetailsProps } from './preview-template-details.types';
import { JSX } from 'react';
import { Filename } from '@atoms/Filename/Filename';

export function PreviewTemplateDetails({
  template,
  templateTypeText,
  additionalMetaFields,
  contentPreview,
}: Readonly<PreviewTemplateDetailsProps>): JSX.Element {
  return (
    <>
      <h1
        data-testid='preview-message__heading'
        className={styles.review__heading}
      >
        {template.name}
      </h1>
      <Container
        className={concatClassNames('nhsuk-u-margin-bottom-6', 'nhsuk-body-m')}
      >
        <div className={styles.preview}>
          <Row className={styles.preview__row}>
            <Col width='one-third' className={styles.preview__col}>
              <div className={styles.preview__col_heading}>Template ID</div>
            </Col>
            <Col width='two-thirds' className={styles.col}>
              {template.id}
            </Col>
          </Row>
          <Row className={styles.preview__row}>
            <Col width='one-third' className={styles.preview__col}>
              <div className={styles.preview__col_heading}>Type</div>
            </Col>
            <Col width='two-thirds' className={styles.col}>
              {templateTypeText}
            </Col>
          </Row>
          <Row className={styles.preview__row}>
            <Col width='one-third' className={styles.preview__col}>
              <div className={styles.preview__col_heading}>Status</div>
            </Col>
            <Col width='two-thirds' className={styles.col}>
              <Tag
                color={
                  template.templateStatus === TemplateStatus.SUBMITTED
                    ? 'grey'
                    : undefined
                }
              >
                {templateStatusToDisplayMappings(template.templateStatus)}
              </Tag>
            </Col>
          </Row>
          {additionalMetaFields?.map((row) => (
            <Row className={styles.preview__row} key={row.id}>
              <Col width='one-third' className={styles.preview__col}>
                <div className={styles.preview__col_heading}>{row.title}</div>
              </Col>
              <Col width='two-thirds' className={styles.col}>
                {row.content}
              </Col>
            </Row>
          ))}
        </div>
        {contentPreview ? (
          <div
            className={concatClassNames('nhsuk-u-margin-top-4', styles.preview)}
          >
            {contentPreview.map(({ heading, value, id }, idx) => (
              <Row key={id} className={styles.preview__row}>
                <Col width='one-third' className={styles.preview__col}>
                  <div
                    id={`preview-heading-${id}`}
                    data-testid={`preview__heading-${idx}`}
                    className={styles.preview__col_heading}
                  >
                    {heading}
                  </div>
                </Col>
                <Col width='two-thirds' className={styles.col}>
                  <div
                    id={`preview-content-${id}`}
                    data-testid={`preview__content-${idx}`}
                    className={styles.preview__col_content}
                    dangerouslySetInnerHTML={{ __html: value }}
                  />
                </Col>
              </Row>
            ))}
          </div>
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
