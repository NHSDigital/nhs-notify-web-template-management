import styles from './Preview.module.scss';

import { Table } from 'nhsuk-react-components';
import concatClassNames from '@utils/concatClassNames';
import { PreviewProps } from './Preview.types';

export function Preview({ preview }: PreviewProps): JSX.Element {
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

Preview.Email = ({ subject, value }: { subject: string; value: string }) => (
  <Preview
    preview={[
      { heading: 'Subject', value: subject },
      { heading: 'Message', value },
    ]}
  />
);

Preview.Letter = ({
  heading,
  bodyText,
}: {
  heading: string;
  bodyText: string;
}) => (
  <Preview
    preview={[
      { heading: 'Heading', value: heading },
      { heading: 'Body text', value: bodyText },
    ]}
  />
);

Preview.NHSApp = ({ message }: { message: string }) => (
  <Preview preview={[{ heading: 'Message', value: message }]} />
);

Preview.SMS = ({ message }: { message: string }) => (
  <Preview preview={[{ heading: 'Message', value: message }]} />
);
