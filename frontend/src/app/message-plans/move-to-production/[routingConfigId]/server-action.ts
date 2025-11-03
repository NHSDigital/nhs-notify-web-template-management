'use server';

import { redirect, RedirectType } from 'next/navigation';
import { z } from 'zod/v4';
import { submitRoutingConfig } from '@utils/message-plans';

export async function moveRoutingConfigToProduction(formData: FormData) {
  const { data: routingConfigId } = z
    .uuidv4()
    .safeParse(formData.get('routingConfigId'));

  if (routingConfigId) {
    await submitRoutingConfig(routingConfigId);

    redirect('/message-plans', RedirectType.push);
  } else {
    redirect('/message-plans/invalid', RedirectType.push);
  }
}
