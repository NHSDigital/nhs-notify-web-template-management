'use server';

import { redirect, RedirectType } from 'next/navigation';
import { submitRoutingConfig } from '@utils/message-plans';

export async function moveRoutingConfigToProduction(formData: FormData) {
  const routingConfigId = formData.get('routingConfigId');

  if (typeof routingConfigId === 'string') {
    await submitRoutingConfig(routingConfigId);

    redirect('/message-plans', RedirectType.push);
  }
}
