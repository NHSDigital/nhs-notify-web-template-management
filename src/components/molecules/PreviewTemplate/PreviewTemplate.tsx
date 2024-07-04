import styles from './PreviewTemplate.module.scss';

import { Table } from 'nhsuk-react-components';
import concatClassNames from '@utils/concatClassNames';
import { PreviewTemplateProps } from './PreviewTemplate.types';

export function PreviewTemplate({
  preview,
}: PreviewTemplateProps): JSX.Element {
  return (
    <Table
      className={concatClassNames(styles.preview, 'nhsuk-u-margin-bottom-4')}
    >
      <Table.Body>
        {preview.map(({ heading, value }, idx) => (
          <Table.Row key={`preview-${idx}`} role='row'>
            <Table.Cell key={`preview__heading-${idx}`} role='cell'>
              <div
                data-testid={`preview__heading-${idx}`}
                className={styles.preview__heading}
              >
                {heading}
              </div>
            </Table.Cell>
            <Table.Cell key={`preview__content-${idx}`} role='cell'>
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
      { heading: 'Subject', value: subject },
      { heading: 'Message', value },
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
      { heading: 'Heading', value: heading },
      { heading: 'Body text', value: bodyText },
    ]}
  />
);

PreviewTemplate.NHSApp = ({ message }: { message: string }) => (
  <PreviewTemplate preview={[{ heading: 'Message', value: message }]} />
);

PreviewTemplate.SMS = ({ message }: { message: string }) => (
  <PreviewTemplate preview={[{ heading: 'Message', value: message }]} />
);
