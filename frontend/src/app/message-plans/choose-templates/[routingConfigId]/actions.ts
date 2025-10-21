'use server';

import { z } from 'zod';
import { getRoutingConfig, updateRoutingConfig } from '@utils/message-plans';
import { $Channel } from 'nhs-notify-backend-client';
import { redirect } from 'next/navigation';

export async function removeTemplateFromMessagePlan(formData: FormData) {
  console.log('remove template from message plan');

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

  const updatedCascade = routingConfig.cascade.map((cascadeItem) => {
    if (cascadeItem.channel === channel) {
      console.log('template ID to remove', cascadeItem.defaultTemplateId);
      return { ...cascadeItem, defaultTemplateId: null };
    } else {
      return cascadeItem;
    }
  });

  const updatedConfig = { ...routingConfig, cascade: updatedCascade };

  await updateRoutingConfig(routingConfigId, updatedConfig);

  redirect(`/message-plans/choose-templates/${routingConfigId}`);
}
