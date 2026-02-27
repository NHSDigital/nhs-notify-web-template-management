/* eslint-disable jsx-a11y/anchor-is-valid */

'use client';

import { Table, Tag } from 'nhsuk-react-components';
import content from '@content/content';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  letterTypeDisplayMappings,
  previewTemplatePages,
  templateTypeDisplayMappings,
  previewSubmittedTemplatePages,
  templateDisplayCopyAction,
  templateDisplayDeleteAction,
  statusToDisplayMapping,
  statusToColourMapping,
} from 'nhs-notify-web-template-management-utils';
import type { TemplateDto } from 'nhs-notify-web-template-management-types';
import style from './MessageTemplates.module.scss';
import { useFeatureFlags } from '@providers/client-config-provider';

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

export function MessageTemplates({
  templateList,
}: {
  templateList: TemplateDto[];
}) {
  const features = useFeatureFlags();
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
              <Table.Cell data-testid='manage-template-table-header-template-id'>
                {messageTemplatesContent.tableHeadings.id}
              </Table.Cell>
              <Table.Cell data-testid='manage-template-table-header-template-type'>
                {messageTemplatesContent.tableHeadings.type}
              </Table.Cell>
              <Table.Cell data-testid='manage-template-table-header-template-status'>
                {messageTemplatesContent.tableHeadings.status}
              </Table.Cell>
              <Table.Cell data-testid='manage-template-table-header-template-date-created'>
                {messageTemplatesContent.tableHeadings.lastEdited}
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
                <Table.Cell>{template.id}</Table.Cell>
                <Table.Cell>{typeDisplayMappings(template)}</Table.Cell>
                <Table.Cell>
                  <Tag color={statusToColourMapping(template, features)}>
                    {statusToDisplayMapping(template, features)}
                  </Tag>
                </Table.Cell>
                <Table.Cell>
                  {format(`${template.updatedAt}`, 'do MMM yyyy')}
                  <br />
                  {format(`${template.updatedAt}`, 'HH:mm')}
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
