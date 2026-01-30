'use client';

import Link from 'next/link';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { createNhsNotifyFormContext } from '@providers/form-provider';
import copy from '@content/content';

const { useNHSNotifyForm, NHSNotifyFormProvider } =
  createNhsNotifyFormContext();

export { NHSNotifyFormProvider };

const content = copy.pages.chooseTemplatesForMessagePlan;

export function MessagePlanChooseTemplatesMoveToProductionForm({
  messagePlanId,
}: {
  messagePlanId: string;
}) {
  const [, action] = useNHSNotifyForm();

  return (
    <NHSNotifyFormWrapper formId='move-to-production' action={action}>
      <div className='nhsuk-form-group' data-testid='message-plan-actions'>
        <input
          name='routingConfigId'
          readOnly
          type='hidden'
          value={messagePlanId}
        />
        <NHSNotifyButton data-testid='move-to-production-cta'>
          {content.ctas.primary.text}
        </NHSNotifyButton>
        <Link href={content.ctas.secondary.href} passHref legacyBehavior>
          <NHSNotifyButton
            secondary
            data-testid='save-and-close-cta'
            className='nhsuk-u-margin-left-3'
          >
            {content.ctas.secondary.text}
          </NHSNotifyButton>
        </Link>
      </div>
    </NHSNotifyFormWrapper>
  );
}
