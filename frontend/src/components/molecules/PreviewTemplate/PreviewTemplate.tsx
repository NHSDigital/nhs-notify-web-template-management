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
import styles from './PreviewTemplate.module.scss';
import { PreviewTemplateProps } from './preview-template.types';
import { JSX } from 'react';
import { Filename } from '@atoms/Filename/Filename';

export function PreviewTemplate({
  template,
  templateTypeText,
  additionalMetaFields,
  contentPreview,
}: Readonly<PreviewTemplateProps>): JSX.Element {
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

PreviewTemplate.Email = ({
  template,
  subject,
  message,
}: {
  template: EmailTemplate;
  subject: string;
  message: string;
}) => (
  <PreviewTemplate
    template={template}
    templateTypeText={templateTypeDisplayMappings(template.templateType)}
    additionalMetaFields={[]}
    contentPreview={[
      { heading: 'Subject', id: 'subject', value: subject },
      { heading: 'Message', id: 'message', value: message },
    ]}
  />
);

PreviewTemplate.NHSApp = ({
  template,
  message,
}: {
  template: NHSAppTemplate;
  message: string;
}) => (
  <PreviewTemplate
    template={template}
    templateTypeText={templateTypeDisplayMappings(template.templateType)}
    contentPreview={[{ heading: 'Message', id: 'message', value: message }]}
  />
);

PreviewTemplate.Sms = ({
  template,
  message,
}: {
  template: SMSTemplate;
  message: string;
}) => (
  <PreviewTemplate
    template={template}
    templateTypeText={templateTypeDisplayMappings(template.templateType)}
    contentPreview={[{ heading: 'Message', id: 'message', value: message }]}
  />
);

PreviewTemplate.Letter = ({ template }: { template: LetterTemplate }) => (
  <PreviewTemplate
    template={template}
    templateTypeText={letterTypeDisplayMappings(
      template.letterType,
      template.language
    )}
    additionalMetaFields={[
      {
        title: 'Template file',
        id: 'templatefile',
        content: <Filename filename={template.pdfTemplateInputFile} />,
      },
      {
        title: 'Test personalisation file',
        id: 'testdatafile',
        content: <Filename filename={template.testPersonalisationInputFile} />,
      },
    ]}
  />
);
