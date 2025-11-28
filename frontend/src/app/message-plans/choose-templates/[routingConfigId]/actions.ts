'use server';

import { z } from 'zod';
import { getRoutingConfig, updateRoutingConfig } from '@utils/message-plans';
import {
  removeTemplatesFromCascadeItem,
  buildCascadeGroupOverridesFromCascade,
} from '@utils/routing-utils';
import { redirect } from 'next/navigation';

export async function removeTemplateFromMessagePlan(formData: FormData) {
  const parseResult = z
    .object({
      routingConfigId: z.uuidv4(),
      templateIds: z.array(z.uuidv4()).min(1),
    })
    .safeParse({
      routingConfigId: formData.get('routingConfigId'),
      templateIds: formData.getAll('templateId'),
    });

  if (!parseResult.success) {
    throw new Error('Invalid form data');
  }

  const { routingConfigId, templateIds } = parseResult.data;

  const routingConfig = await getRoutingConfig(routingConfigId);

  if (!routingConfig)
    throw new Error(`Routing configuration ${routingConfigId} not found`);

  const { cascade } = routingConfig;

  const updatedCascade = cascade.map((cascadeItem) =>
    removeTemplatesFromCascadeItem(cascadeItem, templateIds)
  );

  const updatedCascadeGroupOverrides =
    buildCascadeGroupOverridesFromCascade(updatedCascade);

  const updatedConfig = {
    cascadeGroupOverrides: updatedCascadeGroupOverrides,
    cascade: updatedCascade,
  };

  await updateRoutingConfig(routingConfigId, updatedConfig);

  redirect(`/message-plans/choose-templates/${routingConfigId}`);
}
