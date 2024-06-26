import styles from './Preview.module.scss';

import { Table } from 'nhsuk-react-components';
import concatClassNames from '@/utils/concatClassNames';
import { PreviewProps } from './Preview.types';

export function Preview({ preview }: PreviewProps): JSX.Element {
  return (
    <Table
      className={concatClassNames(styles.preview, 'nhsuk-u-margin-bottom-4')}
    >
      <Table.Body>
        {preview.map(({ heading, value }, idx) => (
          <Table.Row key={`message-preview-${idx}`} role='row'>
            <Table.Cell key={`message-preview-heading-${idx}`} role='cell'>
              <div className={styles.preview__heading}>{heading}</div>
            </Table.Cell>
            <Table.Cell key={`message-preview-content-${idx}`} role='cell'>
              <div
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
