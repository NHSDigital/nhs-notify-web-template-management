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
import { ActionLink } from './ActionLink';
import concatClassNames from '@utils/concat-class-names';
import {
  useCampaignIds,
  useFeatureFlags,
} from '@providers/client-config-provider';
import Link from 'next/link';
import { toKebabCase } from '@utils/kebab-case';
import styles from './PreviewTemplateDetails.module.scss';
import { interpolate } from '@utils/interpolate';

const { rowHeadings, visuallyHidden, externalLinks, actions, links } =
  content.components.previewTemplateDetails;

export default function PreviewTemplateDetailsAuthoringLetter({
  template,
  hideStatus,
  hideEditActions,
}: {
  template: AuthoringLetterTemplate;
  hideStatus?: boolean;
  hideEditActions?: boolean;
}) {
  const features = useFeatureFlags();
  const campaignIds = useCampaignIds();

  const pageCount = template.files.initialRender?.pageCount;
  const sheets = pageCount ? Math.ceil(pageCount / 2) : undefined;

  const hasSingleCampaign = campaignIds.length === 1;

  const pendingValidation = template.templateStatus === 'PENDING_VALIDATION';
  const validationFailed = template.templateStatus === 'VALIDATION_FAILED';

  const hasInitialRender = Boolean(template.files.initialRender);

  const unvalidated = pendingValidation || validationFailed;

  const hideEditElements = hideEditActions || unvalidated;

  const hideEditCampaignLink =
    hideEditElements || (template.campaignId && hasSingleCampaign);

  const hideCampaignRow = unvalidated;
  const hidePostageRow = unvalidated;

  const hideSidesAndPages = pendingValidation || !hasInitialRender;

  return (
    <>
      <DetailsHeader templateName={template.name} />

      {!hideEditElements && (
        <p className='nhsuk-u-margin-bottom-4'>
          <Link
            href={interpolate(links.editTemplateName, {
              templateId: template.id,
            })}
            data-testid='edit-name-link'
          >
            {actions.editName}
            <span className='nhsuk-u-visually-hidden'>
              {' '}
              for {template.name}
            </span>
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
          {!hideCampaignRow && (
            <SummaryList.Row
              id='campaign-id'
              className={template.campaignId ? undefined : 'missing-value'}
            >
              <SummaryList.Key>{rowHeadings.campaignId}</SummaryList.Key>
              <SummaryList.Value>{template.campaignId}</SummaryList.Value>
              <ActionLink
                href={interpolate(links.editTemplateCampaign, {
                  templateId: template.id,
                })}
                label={actions.edit}
                visuallyHiddenText={visuallyHidden.campaign}
                hidden={!!hideEditCampaignLink}
                testId='campaign-action'
              />
            </SummaryList.Row>
          )}

          {/* Total pages */}
          {!hideSidesAndPages && (
            <SummaryList.Row>
              <SummaryList.Key>{rowHeadings.totalPages}</SummaryList.Key>
              <SummaryList.Value>{pageCount}</SummaryList.Value>
              <SummaryList.Actions />
            </SummaryList.Row>
          )}

          {/* Sheets */}
          {!hideSidesAndPages && (
            <SummaryList.Row>
              <SummaryList.Key>{rowHeadings.sheets}</SummaryList.Key>
              <SummaryList.Value>{sheets}</SummaryList.Value>
              <ActionLink
                href={externalLinks.lettersPricing}
                label={actions.learnMore}
                visuallyHiddenText={visuallyHidden.sheets}
                testId='sheets-action'
                external
              />
            </SummaryList.Row>
          )}

          {/* Printing and postage */}
          {!hidePostageRow && (
            <SummaryList.Row
              className={template.letterVariantId ? undefined : 'missing-value'}
            >
              <SummaryList.Key>
                {rowHeadings.printingAndPostage}
              </SummaryList.Key>
              <SummaryList.Value>{template.letterVariantId}</SummaryList.Value>
              <ActionLink
                href={interpolate(links.choosePrintingAndPostage, {
                  templateId: template.id,
                })}
                label={actions.edit}
                visuallyHiddenText={visuallyHidden.printingAndPostage}
                hidden={hideEditElements}
                testId='printing-postage-action'
              />
            </SummaryList.Row>
          )}

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
                label={actions.learnMore}
                visuallyHiddenText={visuallyHidden.status}
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
