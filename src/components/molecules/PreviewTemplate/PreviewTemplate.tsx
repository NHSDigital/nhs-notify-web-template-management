import { Container, Row, Col } from 'nhsuk-react-components';
import concatClassNames from '@utils/concat-class-names';
import styles from './PreviewTemplate.module.scss';
import { PreviewTemplateProps } from './preview-template.types';

export function PreviewTemplate({
  preview,
}: Readonly<PreviewTemplateProps>): JSX.Element {
  return (
    <Container
      className={concatClassNames('nhsuk-u-margin-bottom-6', 'nhsuk-body-m')}
    >
      <div className={styles.preview}>
        {preview.map(({ heading, value, id }, idx) => (
          <Row key={id} className={styles.preview__row}>
            <Col width='one-third' className={styles.preview__col}>
              <div
                data-testid={`preview__heading-${idx}`}
                className={styles.preview__col_heading}
              >
                {heading}
              </div>
            </Col>
            <Col width='two-thirds' className={styles.col}>
              <div
                data-testid={`preview__content-${idx}`}
                className={styles.preview__col_content}
                dangerouslySetInnerHTML={{ __html: value }}
              />
            </Col>
          </Row>
        ))}
      </div>
    </Container>
  );
}

PreviewTemplate.Email = ({
  subject,
  message,
}: {
  subject: string;
  message: string;
}) => (
  <PreviewTemplate
    preview={[
      { heading: 'Subject', id: 'subject', value: subject },
      { heading: 'Message', id: 'message', value: message },
    ]}
  />
);

PreviewTemplate.Letter = ({
  heading,
  bodyText,
}: {
  heading: string;
  bodyText: string;
}) => (
  <PreviewTemplate
    preview={[
      { heading: 'Heading', id: 'heading', value: heading },
      { heading: 'Body text', id: 'body-text', value: bodyText },
    ]}
  />
);

PreviewTemplate.NHSApp = ({ message }: { message: string }) => (
  <PreviewTemplate
    preview={[{ heading: 'Message', id: 'message', value: message }]}
  />
);

PreviewTemplate.Sms = ({ message }: { message: string }) => (
  <PreviewTemplate
    preview={[{ heading: 'Message', id: 'message', value: message }]}
  />
);
