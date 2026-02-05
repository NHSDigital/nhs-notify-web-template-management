'use server';

import { redirect, RedirectType } from 'next/navigation';
import { submitRoutingConfig } from '@utils/message-plans';

export async function moveToProduction(
  routingConfigId: string,
  lockNumber: number
) {
  await submitRoutingConfig(routingConfigId, lockNumber);
  redirect('/message-plans', RedirectType.replace);
}
