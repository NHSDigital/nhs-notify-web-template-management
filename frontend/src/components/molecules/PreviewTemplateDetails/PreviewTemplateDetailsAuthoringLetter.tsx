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
import {
  useCampaignIds,
  useFeatureFlags,
} from '@providers/client-config-provider';
import Link from 'next/link';
import { toKebabCase } from '@utils/kebab-case';
import styles from './PreviewTemplateDetails.module.scss';

const { rowHeadings, visuallyHidden } =
  content.components.previewTemplateDetails;

export default function PreviewTemplateDetailsAuthoringLetter({
  template,
  hideStatus,
  hideActions,
}: {
  template: AuthoringLetterTemplate;
  hideStatus?: boolean;
  hideActions?: boolean;
}) {
  const features = useFeatureFlags();
  const campaignIds = useCampaignIds();
  const totalPages = Math.ceil(template.sidesCount / 2);
  const hasSingleCampaign = campaignIds.length === 1;

  return (
    <>
      <DetailsHeader templateName={template.name} />

      {!hideActions && (
        <p className='nhsuk-u-margin-bottom-4'>
          <Link
            href={`edit-template-name/${template.id}`}
            data-testid='edit-name-link'
          >
            Edit name
          </Link>
        </p>
      )}

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
            <SummaryList.Key>{rowHeadings.templateType}</SummaryList.Key>
            <SummaryList.Value>
              {letterTypeDisplayMappings(
                template.letterType,
                template.language
              )}
            </SummaryList.Value>
            <SummaryList.Actions />
          </SummaryList.Row>

          {/* Campaign */}
          <SummaryList.Row
            id='campaign-id'
            className={template.campaignId ? undefined : styles.missingValue}
          >
            <SummaryList.Key>{rowHeadings.campaignId}</SummaryList.Key>
            <SummaryList.Value>{template.campaignId}</SummaryList.Value>
            {hideActions || (template.campaignId && hasSingleCampaign) ? (
              <SummaryList.Actions />
            ) : (
              <SummaryList.Actions className='nhsuk-u-padding-right-4'>
                <Link
                  href={`edit-template-campaign/${template.id}`}
                  data-testid='campaign-action'
                >
                  Edit
                  <span className='nhsuk-u-visually-hidden'>
                    {' '}
                    {visuallyHidden.campaign}
                  </span>
                </Link>
              </SummaryList.Actions>
            )}
          </SummaryList.Row>

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
            {hideActions ? (
              <SummaryList.Actions />
            ) : (
              <SummaryList.Actions className='nhsuk-u-padding-right-4'>
                <Link
                  href='https://notify.nhs.uk/pricing-and-commercial/letters'
                  data-testid='sheets-action'
                >
                  Learn more
                  <span className='nhsuk-u-visually-hidden'>
                    {' '}
                    {visuallyHidden.sheets}
                  </span>
                </Link>
              </SummaryList.Actions>
            )}
          </SummaryList.Row>

          {/* Printing and postage */}
          <SummaryList.Row
            className={
              template.letterVariantId ? undefined : styles.missingValue
            }
          >
            <SummaryList.Key>{rowHeadings.printingAndPostage}</SummaryList.Key>
            <SummaryList.Value>{template.letterVariantId}</SummaryList.Value>
            {hideActions ? (
              <SummaryList.Actions />
            ) : (
              <SummaryList.Actions className='nhsuk-u-padding-right-4'>
                <Link
                  href={`choose-printing-and-postage/${template.id}`}
                  data-testid='printing-postage-action'
                >
                  Edit
                  <span className='nhsuk-u-visually-hidden'>
                    {' '}
                    {visuallyHidden.printingAndPostage}
                  </span>
                </Link>
              </SummaryList.Actions>
            )}
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
              {hideActions ? (
                <SummaryList.Actions />
              ) : (
                <SummaryList.Actions className='nhsuk-u-padding-right-4'>
                  <Link
                    href='https://notify.nhs.uk/templates/what-template-statuses-mean'
                    data-testid='status-action'
                  >
                    Learn more
                    <span className='nhsuk-u-visually-hidden'>
                      {' '}
                      {visuallyHidden.status}
                    </span>
                  </Link>
                </SummaryList.Actions>
              )}
            </SummaryList.Row>
          )}
        </DetailSection>
      </Container>
    </>
  );
}
