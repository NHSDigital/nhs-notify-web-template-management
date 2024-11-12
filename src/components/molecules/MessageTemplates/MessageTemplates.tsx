'use client';

import { Table, Tag } from 'nhsuk-react-components';
import content from '@content/content';
import { Template } from '@domain/templates';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  TemplateStatus,
  TemplateStatusText,
  TemplateTypeText,
} from '@utils/types';

const manageTemplatesContent = content.pages.manageTemplates;

export function MessageTemplates({
  availableTemplateList,
}: {
  availableTemplateList: Template[];
}) {
  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-full'>
        <Table caption={manageTemplatesContent.listOfTemplates} responsive>
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
            {availableTemplateList.map((template) => (
              <Table.Row key={template.id}>
                <Table.Cell>
                  <Link href='#'>{template.name}</Link>
                </Table.Cell>
                <Table.Cell>{TemplateTypeText[template.type]}</Table.Cell>
                <Table.Cell>
                  <Tag color='grey'>
                    {
                      TemplateStatusText[TemplateStatus.Submitted] // TemplateStatus.submitted is currently used in place of the status that will be gotten from the db in ticket CCM-5630
                    }
                  </Tag>
                </Table.Cell>
                <Table.Cell>
                  {format(`${template.createdAt}`, 'do MMM yyyy')}
                </Table.Cell>
                <Table.Cell>
                  <Link href='#'>
                    <p className='nhsuk-u-margin-bottom-2'>
                      {manageTemplatesContent.tableHeadings.action.copy}
                    </p>
                  </Link>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
