import { Container, Row, Col, Tag } from 'nhsuk-react-components';
import concatClassNames from '@utils/concat-class-names';
import {
  TemplateStatus,
  templateStatustoDisplayMappings,
  templateTypeDisplayMappings,
} from 'nhs-notify-web-template-management-utils/src/enum';
import {
  Template
} from 'nhs-notify-web-template-management-utils/src/types';
import styles from './PreviewTemplate.module.scss';
import { PreviewTemplateProps } from './preview-template.types';

export function PreviewTemplate({
  template,
  preview,
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
              {templateTypeDisplayMappings(template.templateType)}
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
                {templateStatustoDisplayMappings(template.templateStatus)}
              </Tag>
            </Col>
          </Row>
        </div>
        <div
          className={concatClassNames('nhsuk-u-margin-top-4', styles.preview)}
        >
          {preview.map(({ heading, value, id }, idx) => (
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
      </Container>
    </>
  );
}

PreviewTemplate.Email = ({
  template,
  subject,
  message,
}: {
  template: Template;
  subject: string;
  message: string;
}) => (
  <PreviewTemplate
    template={template}
    preview={[
      { heading: 'Subject', id: 'subject', value: subject },
      { heading: 'Message', id: 'message', value: message },
    ]}
  />
);

PreviewTemplate.Letter = ({
  template,
  heading,
  bodyText,
}: {
  template: Template;
  heading: string;
  bodyText: string;
}) => (
  <PreviewTemplate
    template={template}
    preview={[
      { heading: 'Heading', id: 'heading', value: heading },
      { heading: 'Body text', id: 'body-text', value: bodyText },
    ]}
  />
);

PreviewTemplate.NHSApp = ({
  template,
  message,
}: {
  template: Template;
  message: string;
}) => (
  <PreviewTemplate
    template={template}
    preview={[{ heading: 'Message', id: 'message', value: message }]}
  />
);

PreviewTemplate.Sms = ({
  template,
  message,
}: {
  template: Template;
  message: string;
}) => (
  <PreviewTemplate
    template={template}
    preview={[{ heading: 'Message', id: 'message', value: message }]}
  />
);
