'use server';

import { z } from 'zod';
import { getRoutingConfig, updateRoutingConfig } from '@utils/message-plans';
import { $Channel, $LockNumber } from 'nhs-notify-backend-client';
import { redirect } from 'next/navigation';

export async function removeTemplateFromMessagePlan(formData: FormData) {
  const parseResult = z
    .object({
      routingConfigId: z.uuidv4(),
      channel: $Channel,
      lockNumber: $LockNumber,
    })
    .safeParse({
      routingConfigId: formData.get('routingConfigId'),
      channel: formData.get('channel'),
      lockNumber: formData.get('lockNumber'),
    });

  if (!parseResult.success) {
    throw new Error('Invalid form data');
  }

  const { routingConfigId, channel, lockNumber } = parseResult.data;

  const routingConfig = await getRoutingConfig(routingConfigId);

  if (!routingConfig)
    throw new Error(`Routing configuration ${routingConfigId} not found`);

  const { cascade, cascadeGroupOverrides } = routingConfig;

  const updatedCascade = cascade.map((cascadeItem) =>
    cascadeItem.channel === channel
      ? { ...cascadeItem, defaultTemplateId: null }
      : cascadeItem
  );

  const updatedConfig = {
    cascadeGroupOverrides,
    cascade: updatedCascade,
  };

  await updateRoutingConfig(routingConfigId, updatedConfig, lockNumber);

  redirect(`/message-plans/choose-templates/${routingConfigId}`);
}
