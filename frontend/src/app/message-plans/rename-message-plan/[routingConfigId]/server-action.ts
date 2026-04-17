'use server';

import { redirect, RedirectType } from 'next/navigation';
import { z } from 'zod/v4';
import type { FormState } from 'nhs-notify-web-template-management-utils';
import { updateRoutingConfig } from '@utils/message-plans';
import { $LockNumber } from 'nhs-notify-backend-client/schemas';
import { $MessagePlanFormData } from '@forms/MessagePlanForm/schema';

const $RenameMessagePlanFormData = $MessagePlanFormData
  .omit({ campaignId: true })
  .extend({
    routingConfigId: z.string({ error: 'Invalid message plan id' }),
    lockNumber: $LockNumber,
  });

export async function renameMessagePlanServerAction(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = $RenameMessagePlanFormData.safeParse(
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
    },
    parsed.data.lockNumber
  );

  redirect(
    `/message-plans/edit-message-plan/${parsed.data.routingConfigId}`,
    RedirectType.push
  );
}
