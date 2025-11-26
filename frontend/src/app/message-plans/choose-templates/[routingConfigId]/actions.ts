'use server';

import { z } from 'zod';
import { getRoutingConfig, updateRoutingConfig } from '@utils/message-plans';
import {
  removeTemplatesFromCascadeItem,
  updateCascadeGroupOverrides,
} from '@utils/routing-utils';
import { redirect } from 'next/navigation';

export async function removeTemplateFromMessagePlan(formData: FormData) {
  const parseResult = z
    .object({
      routingConfigId: z.uuidv4(),
      templateId: z.union([
        z.string().nonempty(),
        z.array(z.string().nonempty()),
      ]),
    })
    .safeParse({
      routingConfigId: formData.get('routingConfigId'),
      templateId: formData.getAll('templateId'),
    });

  if (!parseResult.success) {
    throw new Error('Invalid form data');
  }

  const { routingConfigId, templateId } = parseResult.data;
  const templateIds = Array.isArray(templateId) ? templateId : [templateId];

  const routingConfig = await getRoutingConfig(routingConfigId);

  if (!routingConfig)
    throw new Error(`Routing configuration ${routingConfigId} not found`);

  const { cascade, cascadeGroupOverrides } = routingConfig;

  const updatedCascade = cascade.map((cascadeItem) =>
    removeTemplatesFromCascadeItem(cascadeItem, templateIds)
  );

  const updatedCascadeGroupOverrides = updateCascadeGroupOverrides(
    cascadeGroupOverrides,
    updatedCascade
  );

  const updatedConfig = {
    cascadeGroupOverrides: updatedCascadeGroupOverrides,
    cascade: updatedCascade,
  };

  await updateRoutingConfig(routingConfigId, updatedConfig);

  redirect(`/message-plans/choose-templates/${routingConfigId}`);
}
