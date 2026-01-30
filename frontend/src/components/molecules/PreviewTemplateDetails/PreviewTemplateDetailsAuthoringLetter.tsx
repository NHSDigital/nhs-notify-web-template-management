'use client';

import { Container, SummaryList, Tag } from 'nhsuk-react-components';
import {
  letterTypeDisplayMappings,
  AuthoringLetterTemplate,
  statusToColourMapping,
  statusToDisplayMapping,
} from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import { DetailSection, DetailsHeader, LockedTemplateWarning } from './common';
import concatClassNames from '@utils/concat-class-names';
import { useFeatureFlags } from '@providers/client-config-provider';
import Link from 'next/link';
import { toKebabCase } from '@utils/kebab-case';
import styles from './PreviewTemplateDetails.module.scss';

const { rowHeadings } = content.components.previewTemplateDetails;

export default function PreviewTemplateDetailsAuthoringLetter({
  template,
  hideStatus,
}: {
  template: AuthoringLetterTemplate;
  hideStatus?: boolean;
}) {
  const features = useFeatureFlags();
  const totalPages = Math.ceil(template.sidesCount / 2);

  return (
    <>
      <DetailsHeader templateName={template.name} />

      <p className='nhsuk-u-margin-bottom-4'>
        <Link href='#' data-testid='edit-name-link'>
          Edit name
        </Link>
      </p>

      {features.routing && template.templateStatus === 'SUBMITTED' && (
        <LockedTemplateWarning template={template} />
      )}

      <Container
        className={concatClassNames('nhsuk-u-margin-bottom-6', 'nhsuk-body-m')}
      >
        <DetailSection className={styles.authoringLetterDetails}>
          {/* Template ID */}
          <SummaryList.Row>
            <SummaryList.Key>{rowHeadings.templateId}</SummaryList.Key>
            <SummaryList.Value
              data-testid='preview-template-id'
              className='monospace-font'
            >
              {template.id}
            </SummaryList.Value>
            <SummaryList.Actions />
          </SummaryList.Row>

          {/* Template type */}
          <SummaryList.Row>
            <SummaryList.Key>{rowHeadings.letterTemplateType}</SummaryList.Key>
            <SummaryList.Value>
              {letterTypeDisplayMappings(
                template.letterType,
                template.language
              )}
            </SummaryList.Value>
            <SummaryList.Actions />
          </SummaryList.Row>

          {/* Campaign */}
          {template.campaignId && (
            <SummaryList.Row>
              <SummaryList.Key>{rowHeadings.campaignId}</SummaryList.Key>
              <SummaryList.Value>{template.campaignId}</SummaryList.Value>
              <SummaryList.Actions>
                <Link href='#' data-testid='campaign-action'>
                  Edit
                  <span className='nhsuk-u-visually-hidden'> campaign</span>
                </Link>
              </SummaryList.Actions>
            </SummaryList.Row>
          )}

          {/* Total pages */}
          <SummaryList.Row>
            <SummaryList.Key>{rowHeadings.totalPages}</SummaryList.Key>
            <SummaryList.Value>{totalPages}</SummaryList.Value>
            <SummaryList.Actions />
          </SummaryList.Row>

          {/* Sheets */}
          <SummaryList.Row>
            <SummaryList.Key>{rowHeadings.sheets}</SummaryList.Key>
            <SummaryList.Value>{template.sidesCount}</SummaryList.Value>
            <SummaryList.Actions>
              <Link
                href='https://notify.nhs.uk/pricing-and-commercial/letters'
                data-testid='sheets-action'
              >
                Learn more
                <span className='nhsuk-u-visually-hidden'> about sheets</span>
              </Link>
            </SummaryList.Actions>
          </SummaryList.Row>

          {/* Printing and postage */}
          <SummaryList.Row
            className={
              template.letterVariantId ? undefined : styles.missingValue
            }
          >
            <SummaryList.Key>{rowHeadings.printingAndPostage}</SummaryList.Key>
            <SummaryList.Value>{template.letterVariantId}</SummaryList.Value>
            <SummaryList.Actions>
              <Link href='#' data-testid='printing-postage-action'>
                Edit
                <span className='nhsuk-u-visually-hidden'>
                  {' '}
                  printing and postage
                </span>
              </Link>
            </SummaryList.Actions>
          </SummaryList.Row>

          {/* Status */}
          {!hideStatus && (
            <SummaryList.Row>
              <SummaryList.Key>{rowHeadings.templateStatus}</SummaryList.Key>
              <SummaryList.Value>
                <Tag
                  data-testid='status-tag'
                  data-status={toKebabCase(template.templateStatus)}
                  color={statusToColourMapping(template, features)}
                >
                  {statusToDisplayMapping(template, features)}
                </Tag>
              </SummaryList.Value>
              <SummaryList.Actions>
                <Link
                  href='https://notify.nhs.uk/templates/what-template-statuses-mean'
                  data-testid='status-action'
                >
                  Learn more
                  <span className='nhsuk-u-visually-hidden'> about status</span>
                </Link>
              </SummaryList.Actions>
            </SummaryList.Row>
          )}
        </DetailSection>
      </Container>
    </>
  );
}
