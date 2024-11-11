'use client';

import { Table } from 'nhsuk-react-components';
import { getBasePath } from '@utils/get-base-path';
import content from '@content/content';
import { Template } from '@domain/templates';

const manageTemplatesContent = content.pages.manageTemplates;

export function MessageTemplates({ list }: { list?: Template[] }) {
  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-full'>
        <Table caption='' responsive>
          <Table.Head role='rowgroup'>
            <Table.Row>
              <Table.Cell>
                {manageTemplatesContent.tableHeadings.name}
              </Table.Cell>
              <Table.Cell>
                {manageTemplatesContent.tableHeadings.type}
              </Table.Cell>
              <Table.Cell>
                {manageTemplatesContent.tableHeadings.status}
              </Table.Cell>
              <Table.Cell>
                {manageTemplatesContent.tableHeadings.dateCreated}
              </Table.Cell>
              <Table.Cell>
                {manageTemplatesContent.tableHeadings.action.text}
              </Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {list?.map((template, idx) => (
              <Table.Row key={`temp-${idx}`}>
                <Table.Cell>{template.name}</Table.Cell>
                <Table.Cell>{template.type}</Table.Cell>
                <Table.Cell>{template.version}</Table.Cell>
                <Table.Cell>{template.createdAt}</Table.Cell>
                <Table.Cell>{template.type}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
