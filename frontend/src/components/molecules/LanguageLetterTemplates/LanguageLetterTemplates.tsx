'use client';

import { Checkboxes, HintText, Table } from 'nhsuk-react-components';
import baseContent from '@content/content';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  letterTypeDisplayMappings,
  ErrorState,
  templateTypeToUrlTextMappings,
  type LetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { interpolate } from '@utils/interpolate';

const { tableHintText, tableContent } =
  baseContent.components.chooseLanguageLetterTemplates;

export function LanguageLetterTemplates({
  routingConfigId,
  templateList,
  errorState,
  selectedTemplates,
  lockNumber,
}: {
  routingConfigId: string;
  templateList: LetterTemplate[];
  errorState: ErrorState | null;
  selectedTemplates: string[];
  lockNumber: number;
}) {
  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-full'>
        <HintText className='nhsuk-u-reading-width' data-testid='table-hint'>
          {tableHintText}
        </HintText>
        <Checkboxes
          id='language-templates'
          error={
            errorState?.fieldErrors?.['language-templates']?.join(', ') || ''
          }
          errorProps={{ id: 'language-templates--error-message' }}
        >
          <Table
            data-testid='language-templates-table'
            id='language-templates-table'
            responsive
          >
            <Table.Head role='rowgroup'>
              <Table.Row>
                <Table.Cell data-testid='language-templates-table-header-template-select'>
                  {tableContent.selectHeading}
                </Table.Cell>
                <Table.Cell data-testid='language-templates-table-header-template-name'>
                  {tableContent.nameHeading}
                </Table.Cell>
                <Table.Cell data-testid='language-templates-table-header-template-type'>
                  {tableContent.typeHeading}
                </Table.Cell>
                <Table.Cell data-testid='language-templates-table-header-template-last-edited'>
                  {tableContent.lastEditedHeading}
                </Table.Cell>
                <Table.Cell data-testid='language-templates-table-header-template-action'>
                  {tableContent.action.heading}
                </Table.Cell>
              </Table.Row>
            </Table.Head>

            <Table.Body>
              {templateList.map((template, index) => (
                <Table.Row key={template.id}>
                  <Table.Cell>
                    <Checkboxes.Box
                      value={`${template.id}:${template.language}`}
                      name={`template_${template.id}`}
                      id={`template-${template.id}`}
                      data-testid={`${template.id}-checkbox`}
                      defaultChecked={selectedTemplates.includes(template.id)}
                    >
                      {' '}
                    </Checkboxes.Box>
                  </Table.Cell>
                  <Table.Cell>
                    <label
                      className='nhsuk-label nhsuk-checkboxes__label nhsuk-u-margin-0 nhsuk-u-padding-0'
                      htmlFor={`template-${template.id}`}
                    >
                      {template.name}
                    </label>
                  </Table.Cell>
                  <Table.Cell>
                    {letterTypeDisplayMappings(
                      template.letterType,
                      template.language
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {format(`${template.updatedAt}`, 'do MMM yyyy')}
                    <br />
                    {format(`${template.updatedAt}`, 'HH:mm')}
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      className='nhsuk-u-margin-bottom-2 nhsuk-link'
                      href={interpolate(tableContent.action.preview.href, {
                        templateType: templateTypeToUrlTextMappings(
                          template.templateType,
                          'language'
                        ),
                        routingConfigId,
                        templateId: template.id,
                        lockNumber,
                      })}
                      id={`preview-template-link-${index}`}
                      aria-label={`${tableContent.action.preview.text} ${template.name}`}
                      data-testid={`${template.id}-preview-link`}
                    >
                      {tableContent.action.preview.text}
                    </Link>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Checkboxes>
      </div>
    </div>
  );
}
