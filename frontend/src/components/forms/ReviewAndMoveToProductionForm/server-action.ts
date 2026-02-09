'use server';

import { redirect, RedirectType } from 'next/navigation';
import { z } from 'zod/v4';
import type { FormState } from 'nhs-notify-web-template-management-utils';
import { $LockNumber } from 'nhs-notify-backend-client';
import { submitRoutingConfig } from '@utils/message-plans';
import content from '@content/content';
import { interpolate } from '@utils/interpolate';
import { getBasePath } from '@utils/get-base-path';

const $MoveToProductionFormData = z.object({
  routingConfigId: z.string({ error: 'Invalid message plan id' }),
  lockNumber: $LockNumber,
});

const pageContent = content.pages.reviewAndMoveToProduction;

export async function moveToProductionAction(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = $MoveToProductionFormData.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!parsed.success) {
    return {
      ...state,
      errorState: z.flattenError(parsed.error),
    };
  }

  delete state.errorState;

  await submitRoutingConfig(
    parsed.data.routingConfigId,
    parsed.data.lockNumber
  );
  redirect(
    interpolate(pageContent.buttons.moveToProduction.href, {
      basePath: getBasePath(),
    }),
    RedirectType.replace
  );
}
