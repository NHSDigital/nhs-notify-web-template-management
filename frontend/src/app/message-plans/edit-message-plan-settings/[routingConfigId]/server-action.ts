'use server';

import { redirect, RedirectType } from 'next/navigation';
import { z } from 'zod/v4';
import type { FormState } from 'nhs-notify-web-template-management-utils';
import { $MessagePlanFormData } from '@forms/MessagePlan/schema';
import { updateRoutingConfig } from '@utils/message-plans';
import { $LockNumber } from 'nhs-notify-backend-client';

const $UpdateMessagePlanFormData = $MessagePlanFormData.extend({
  routingConfigId: z.string({ error: 'Invalid message plan id' }),
  lockNumber: $LockNumber,
});

export async function editMessagePlanSettingsServerAction(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = $UpdateMessagePlanFormData.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!parsed.success) {
    return {
      ...state,
      errorState: z.flattenError(parsed.error),
    };
  }

  delete state.errorState;

  await updateRoutingConfig(
    parsed.data.routingConfigId,
    {
      name: parsed.data.name,
      campaignId: parsed.data.campaignId,
    },
    parsed.data.lockNumber
  );

  redirect(
    `/message-plans/choose-templates/${parsed.data.routingConfigId}`,
    RedirectType.push
  );
}
