/* eslint-disable jsx-a11y/anchor-is-valid */

'use client';

import { Table, Tag } from 'nhsuk-react-components';
import content from '@content/content';
import { Template } from 'nhs-notify-web-template-management-utils/src/types';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  TemplateStatus,
  templateStatustoDisplayMappings,
  templateTypeDisplayMappings,
} from 'nhs-notify-web-template-management-utils/src/enum';

const manageTemplatesContent = content.pages.manageTemplates;

export function ManageTemplates({
  templateList,
}: {
  templateList: Template[];
}) {
  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-full'>
        <Table
          caption={manageTemplatesContent.listOfTemplates}
          data-testid='manage-template-table'
          id='manage-template-table'
          responsive
        >
          <Table.Head role='rowgroup'>
            <Table.Row>
              <Table.Cell data-testid='manage-template-table-header-template-name'>
                {manageTemplatesContent.tableHeadings.name}
              </Table.Cell>
              <Table.Cell data-testid='manage-template-table-header-template-type'>
                {manageTemplatesContent.tableHeadings.type}
              </Table.Cell>
              <Table.Cell data-testid='manage-template-table-header-template-status'>
                {manageTemplatesContent.tableHeadings.status}
              </Table.Cell>
              <Table.Cell data-testid='manage-template-table-header-template-date-created'>
                {manageTemplatesContent.tableHeadings.dateCreated}
              </Table.Cell>
              <Table.Cell data-testid='manage-template-table-header-action'>
                {manageTemplatesContent.tableHeadings.action.text}
              </Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {templateList.map((template) => (
              <Table.Row key={template.id}>
                <Table.Cell>
                  <Link href='#'>{template.name}</Link>
                </Table.Cell>
                <Table.Cell>
                  {templateTypeDisplayMappings(template.templateType)}
                </Table.Cell>
                <Table.Cell>
                  <Tag
                    color={
                      template.templateStatus === TemplateStatus.SUBMITTED
                        ? 'grey'
                        : undefined
                    }
                  >
                    {templateStatustoDisplayMappings(template.templateStatus)}
                  </Tag>
                </Table.Cell>
                <Table.Cell>
                  {format(`${template.createdAt}`, 'do MMM yyyy')}
                  <br />
                  {format(`${template.createdAt}`, 'HH:mm')}
                </Table.Cell>
                <Table.Cell>
                  <p className='nhsuk-u-margin-bottom-2'>
                    <Link href='#'>
                      {manageTemplatesContent.tableHeadings.action.copy}
                    </Link>
                  </p>
                  {template.templateStatus ===
                  TemplateStatus.NOT_YET_SUBMITTED ? (
                    <p className='nhsuk-u-margin-bottom-2'>
                      <Link href='#'>
                        {manageTemplatesContent.tableHeadings.action.delete}
                      </Link>
                    </p>
                  ) : null}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
