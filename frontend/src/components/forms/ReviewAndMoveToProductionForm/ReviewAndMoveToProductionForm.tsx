'use client';

import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { useNHSNotifyForm } from '@providers/form-provider';
import content from '@content/content';
import { interpolate } from '@utils/interpolate';
import { getBasePath } from '@utils/get-base-path';

const pageContent = content.pages.reviewAndMoveToProduction;
const basePath = getBasePath();

export function ReviewAndMoveToProductionForm({
  routingConfigId,
  lockNumber,
}: {
  routingConfigId: string;
  lockNumber: number;
}) {
  const [, action] = useNHSNotifyForm();

  return (
    <div className='nhsuk-form-group'>
      <NHSNotifyFormWrapper
        action={action}
        formId='review-and-move-to-production'
      >
        <input
          type='hidden'
          name='routingConfigId'
          value={routingConfigId}
          readOnly
        />
        <input type='hidden' name='lockNumber' value={lockNumber} readOnly />
        <NHSNotifyButton
          warning
          type='submit'
          data-testid='move-to-production-button'
        >
          {pageContent.buttons.moveToProduction.text}
        </NHSNotifyButton>
        <NHSNotifyButton
          secondary
          href={interpolate(pageContent.buttons.keepInDraft.href, {
            basePath,
            routingConfigId,
          })}
          className='nhsuk-u-margin-left-3'
          data-testid='keep-in-draft-link'
        >
          {pageContent.buttons.keepInDraft.text}
        </NHSNotifyButton>
      </NHSNotifyFormWrapper>
    </div>
  );
}
