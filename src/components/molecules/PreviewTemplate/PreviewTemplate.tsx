import { Table } from 'nhsuk-react-components';
import concatClassNames from '@utils/concat-class-names';
import styles from './PreviewTemplate.module.scss';
import { PreviewTemplateProps } from './preview-template.types';

export function PreviewTemplate({
  preview,
}: PreviewTemplateProps): JSX.Element {
  return (
    <Table
      className={concatClassNames(styles.preview, 'nhsuk-u-margin-bottom-4')}
    >
      <Table.Body>
        {preview.map(({ heading, value, id }, idx) => (
          <Table.Row key={id} role='row'>
            <Table.Cell key={id} role='cell'>
              <div
                data-testid={`preview__heading-${idx}`}
                className={styles.preview__heading}
              >
                {heading}
              </div>
            </Table.Cell>
            <Table.Cell key={id} role='cell'>
              <div
                data-testid={`preview__content-${idx}`}
                className={styles.preview__content}
                dangerouslySetInnerHTML={{ __html: value }}
              />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

PreviewTemplate.Email = ({
  subject,
  value,
}: {
  subject: string;
  value: string;
}) => (
  <PreviewTemplate
    preview={[
      { heading: 'Subject', id: 'subject', value: subject },
      { heading: 'Message', id: 'message', value },
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

PreviewTemplate.SMS = ({ message }: { message: string }) => (
  <PreviewTemplate
    preview={[{ heading: 'Message', id: 'message', value: message }]}
  />
);
