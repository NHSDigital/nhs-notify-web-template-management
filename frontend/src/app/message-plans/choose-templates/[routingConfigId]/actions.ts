'use server';

import { z } from 'zod';
import { getRoutingConfig, updateRoutingConfig } from '@utils/message-plans';
import { $Channel } from 'nhs-notify-backend-client';
import { redirect } from 'next/navigation';

export async function removeTemplateFromMessagePlan(formData: FormData) {
  const parseResult = z
    .object({
      routingConfigId: z.uuidv4(),
      channel: $Channel,
    })
    .safeParse({
      routingConfigId: formData.get('routingConfigId'),
      channel: formData.get('channel'),
    });

  if (!parseResult.success) {
    throw new Error('Invalid form data');
  }

  const { routingConfigId, channel } = parseResult.data;

  const routingConfig = await getRoutingConfig(routingConfigId);

  if (!routingConfig)
    throw new Error(`Routing configuration ${routingConfigId} not found`);

  const { campaignId, cascade, cascadeGroupOverrides, name } = routingConfig;

  const updatedCascade = cascade.map((cascadeItem) =>
    cascadeItem.channel === channel
      ? { ...cascadeItem, defaultTemplateId: null }
      : cascadeItem
  );

  const updatedConfig = {
    campaignId,
    name,
    cascadeGroupOverrides,
    cascade: updatedCascade,
  };

  await updateRoutingConfig(routingConfigId, updatedConfig);

  redirect(`/message-plans/choose-templates/${routingConfigId}`);
}
