/* eslint-disable jsx-a11y/anchor-is-valid */

'use client';

import { Table, Tag } from 'nhsuk-react-components';
import content from '@content/content';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  letterTypeDisplayMappings,
  previewTemplatePages,
  templateStatusToDisplayMappings,
  templateTypeDisplayMappings,
  viewSubmittedTemplatePages,
} from 'nhs-notify-web-template-management-utils';
import { TemplateDto } from 'nhs-notify-backend-client';
import style from './ManageTemplates.module.scss';

const manageTemplatesContent = content.pages.manageTemplates;

const generateViewTemplateLink = (template: TemplateDto): string => {
  if (template.templateStatus === 'SUBMITTED') {
    return `/${viewSubmittedTemplatePages(template.templateType)}/${template.id}`;
  }

  return `/${previewTemplatePages(template.templateType)}/${template.id}`;
};

const typeDisplayMappings = (template: TemplateDto): string =>
  template.templateType === 'LETTER' &&
  'letterType' in template &&
  template.letterType &&
  'language' in template &&
  template.language
    ? letterTypeDisplayMappings(template.letterType, template.language)
    : templateTypeDisplayMappings(template.templateType);

export function ManageTemplates({
  templateList,
}: {
  templateList: TemplateDto[];
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
            {templateList.map((template, index) => (
              <Table.Row key={template.id}>
                <Table.Cell>
                  <Link href={generateViewTemplateLink(template)}>
                    {template.name}
                  </Link>
                </Table.Cell>
                <Table.Cell>{typeDisplayMappings(template)}</Table.Cell>
                <Table.Cell>
                  <Tag
                    color={
                      template.templateStatus === 'SUBMITTED'
                        ? 'grey'
                        : undefined
                    }
                  >
                    {templateStatusToDisplayMappings(template.templateStatus)}
                  </Tag>
                </Table.Cell>
                <Table.Cell>
                  {format(`${template.createdAt}`, 'do MMM yyyy')}
                  <br />
                  {format(`${template.createdAt}`, 'HH:mm')}
                </Table.Cell>
                <Table.Cell>
                  <div className={style.actionLinksWrapper}>
                    {template.templateType === 'LETTER' ? null : (
                      <p className='nhsuk-u-margin-bottom-2'>
                        <Link
                          href={`/copy-template/${template.id}`}
                          id={`copy-template-link-${index}`}
                          aria-label={`${manageTemplatesContent.tableHeadings.action.copy} ${template.name}`}
                        >
                          {manageTemplatesContent.tableHeadings.action.copy}
                        </Link>
                      </p>
                    )}
                    {template.templateStatus === 'NOT_YET_SUBMITTED' ? (
                      <p className='nhsuk-u-margin-bottom-2'>
                        <Link
                          href={`/delete-template/${template.id}`}
                          aria-label={`${manageTemplatesContent.tableHeadings.action.delete} ${template.name}`}
                        >
                          {manageTemplatesContent.tableHeadings.action.delete}
                        </Link>
                      </p>
                    ) : null}
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
