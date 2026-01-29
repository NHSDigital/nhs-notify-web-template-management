'use client';

import { HintText, Radios, Table } from 'nhsuk-react-components';
import baseContent from '@content/content';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  letterTypeDisplayMappings,
  templateTypeDisplayMappings,
  ErrorState,
  templateTypeToUrlTextMappings,
  RoutingSupportedLetterType,
} from 'nhs-notify-web-template-management-utils';
import { TemplateDto } from 'nhs-notify-backend-client';
import { interpolate } from '@utils/interpolate';

const { tableHintText, tableContent } =
  baseContent.components.chooseChannelTemplate;

const typeDisplayMappings = (template: TemplateDto): string =>
  template.templateType === 'LETTER'
    ? letterTypeDisplayMappings(template.letterType, template.language)
    : templateTypeDisplayMappings(template.templateType);

export function ChannelTemplates({
  routingConfigId,
  templateList,
  errorState,
  selectedTemplate,
  letterType,
  lockNumber,
}: {
  routingConfigId: string;
  templateList: TemplateDto[];
  errorState: ErrorState | null;
  selectedTemplate: string | null;
  letterType?: RoutingSupportedLetterType;
  lockNumber: number;
}) {
  return (
    <div className='nhsuk-grid-row'>
      <div className='nhsuk-grid-column-full'>
        <HintText className='nhsuk-u-reading-width' data-testid='table-hint'>
          {tableHintText}
        </HintText>
        <Radios
          id='channelTemplate'
          error={errorState?.fieldErrors?.['channelTemplate']?.join(', ')}
          errorProps={{ id: 'channelTemplate--error-message' }}
        >
          <Table
            data-testid='channel-templates-table'
            id='channel-templates-table'
            responsive
          >
            <Table.Head role='rowgroup'>
              <Table.Row>
                <Table.Cell data-testid='channel-templates-table-header-template-select'>
                  {tableContent.selectHeading}
                </Table.Cell>
                <Table.Cell data-testid='channel-templates-table-header-template-name'>
                  {tableContent.nameHeading}
                </Table.Cell>
                <Table.Cell data-testid='channel-templates-table-header-template-type'>
                  {tableContent.typeHeading}
                </Table.Cell>
                <Table.Cell data-testid='channel-templates-table-header-template-last-edited'>
                  {tableContent.lastEditedHeading}
                </Table.Cell>
                <Table.Cell data-testid='channel-templates-table-header-template-action'>
                  {tableContent.action.heading}
                </Table.Cell>
              </Table.Row>
            </Table.Head>

            <Table.Body>
              {templateList.map((template, index) => (
                <Table.Row key={template.id}>
                  <Table.Cell>
                    <Radios.Radio
                      value={template.id}
                      id={`channelTemplate-${template.id}`}
                      data-testid={`${template.id}-radio`}
                      key={`${template.id}-radio`}
                      defaultChecked={template.id === selectedTemplate}
                    >
                      {' '}
                    </Radios.Radio>
                  </Table.Cell>
                  <Table.Cell>{template.name}</Table.Cell>
                  <Table.Cell>{typeDisplayMappings(template)}</Table.Cell>
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
                          letterType
                        ),
                        routingConfigId,
                        templateId: template.id,
                        lockNumber,
                      })}
                      id={`preview-template-link-${index}`}
                      aria-label={`${tableContent.action.preview.text}`}
                      data-testid={`${template.id}-preview-link`}
                    >
                      {tableContent.action.preview.text}
                    </Link>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Radios>
      </div>
    </div>
  );
}
