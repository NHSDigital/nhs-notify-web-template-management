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

const { rowHeadings, visuallyHidden, externalLinks } =
  content.components.previewTemplateDetails;

function ActionLink({
  href,
  label,
  visuallyHiddenText,
  hidden,
  testId,
  external,
}: {
  href: string;
  label: string;
  visuallyHiddenText: string;
  hidden?: boolean;
  testId?: string;
  external?: boolean;
}) {
  if (hidden) {
    return <SummaryList.Actions />;
  }

  const externalProps = external
    ? { target: '_blank' as const, rel: 'noopener noreferrer' }
    : {};

  return (
    <SummaryList.Actions className='nhsuk-u-padding-right-4'>
      <Link href={href} data-testid={testId} {...externalProps}>
        {label}
        <span className='nhsuk-u-visually-hidden'> {visuallyHiddenText}</span>
      </Link>
    </SummaryList.Actions>
  );
}

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

  const hideEditCampaignLink =
    hideActions || (template.campaignId && hasSingleCampaign);

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
            <ActionLink
              href={`edit-template-campaign/${template.id}`}
              label='Edit'
              visuallyHiddenText={visuallyHidden.campaign}
              hidden={!!hideEditCampaignLink}
              testId='campaign-action'
            />
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
            <ActionLink
              href={externalLinks.lettersPricing}
              label='Learn more'
              visuallyHiddenText={visuallyHidden.sheets}
              hidden={hideActions}
              testId='sheets-action'
              external
            />
          </SummaryList.Row>

          {/* Printing and postage */}
          <SummaryList.Row
            className={
              template.letterVariantId ? undefined : styles.missingValue
            }
          >
            <SummaryList.Key>{rowHeadings.printingAndPostage}</SummaryList.Key>
            <SummaryList.Value>{template.letterVariantId}</SummaryList.Value>
            <ActionLink
              href={`choose-printing-and-postage/${template.id}`}
              label='Edit'
              visuallyHiddenText={visuallyHidden.printingAndPostage}
              hidden={hideActions}
              testId='printing-postage-action'
            />
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
              <ActionLink
                href={externalLinks.templateStatuses}
                label='Learn more'
                visuallyHiddenText={visuallyHidden.status}
                hidden={hideActions}
                testId='status-action'
                external
              />
            </SummaryList.Row>
          )}
        </DetailSection>
      </Container>
    </>
  );
}
