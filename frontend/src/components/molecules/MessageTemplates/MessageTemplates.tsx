/* eslint-disable jsx-a11y/anchor-is-valid */

'use client';

import { Table, Tag } from 'nhsuk-react-components';
import content from '@content/content';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  letterTypeDisplayMappings,
  previewTemplatePages,
  templateStatusToColourMappings,
  templateStatusToDisplayMappings,
  templateTypeDisplayMappings,
  previewSubmittedTemplatePages,
  templateDisplayCopyAction,
  templateDisplayDeleteAction,
  templateStatusToDisplayMappingsDigital,
} from 'nhs-notify-web-template-management-utils';
import { TemplateDto } from 'nhs-notify-backend-client';
import style from './MessageTemplates.module.scss';

const messageTemplatesContent = content.pages.messageTemplates;

const generateViewTemplateLink = (template: TemplateDto): string => {
  if (template.templateStatus === 'SUBMITTED') {
    return `/${previewSubmittedTemplatePages(template.templateType)}/${template.id}`;
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

const statusToDisplayMapping = (template: TemplateDto): string =>
  template.templateType === 'LETTER'
    ? templateStatusToDisplayMappings(template.templateStatus)
    : templateStatusToDisplayMappingsDigital(template.templateStatus);

export function MessageTemplates({
  templateList,
}: {
  templateList: TemplateDto[];
}) {
  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-full'>
        <Table
          caption={messageTemplatesContent.listOfTemplates}
          data-testid='manage-template-table'
          id='manage-template-table'
          responsive
        >
          <Table.Head role='rowgroup'>
            <Table.Row>
              <Table.Cell data-testid='manage-template-table-header-template-name'>
                {messageTemplatesContent.tableHeadings.name}
              </Table.Cell>
              <Table.Cell data-testid='manage-template-table-header-template-type'>
                {messageTemplatesContent.tableHeadings.type}
              </Table.Cell>
              <Table.Cell data-testid='manage-template-table-header-template-status'>
                {messageTemplatesContent.tableHeadings.status}
              </Table.Cell>
              <Table.Cell data-testid='manage-template-table-header-template-date-created'>
                {messageTemplatesContent.tableHeadings.dateCreated}
              </Table.Cell>
              <Table.Cell data-testid='manage-template-table-header-action'>
                {messageTemplatesContent.tableHeadings.action.text}
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
                    color={templateStatusToColourMappings(
                      template.templateStatus
                    )}
                  >
                    {statusToDisplayMapping(template)}
                  </Tag>
                </Table.Cell>
                <Table.Cell>
                  {format(`${template.createdAt}`, 'do MMM yyyy')}
                  <br />
                  {format(`${template.createdAt}`, 'HH:mm')}
                </Table.Cell>
                <Table.Cell>
                  <div className={style.actionLinksWrapper}>
                    {templateDisplayCopyAction(template) ? (
                      <p className='nhsuk-u-margin-bottom-2'>
                        <Link
                          href={`/copy-template/${template.id}`}
                          id={`copy-template-link-${index}`}
                          aria-label={`${messageTemplatesContent.tableHeadings.action.copy} ${template.name}`}
                          data-testid='copy-link'
                        >
                          {messageTemplatesContent.tableHeadings.action.copy}
                        </Link>
                      </p>
                    ) : null}
                    {templateDisplayDeleteAction(template) ? (
                      <p className='nhsuk-u-margin-bottom-2'>
                        <Link
                          href={`/delete-template/${template.id}`}
                          aria-label={`${messageTemplatesContent.tableHeadings.action.delete} ${template.name}`}
                          data-testid='delete-link'
                        >
                          {messageTemplatesContent.tableHeadings.action.delete}
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
