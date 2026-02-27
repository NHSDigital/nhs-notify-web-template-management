'use server';

import { redirect, RedirectType } from 'next/navigation';
import { z } from 'zod/v4';
import type {
  CascadeItem,
  Channel,
} from 'nhs-notify-web-template-management-types';
import {
  MESSAGE_ORDER_OPTIONS_LIST,
  type FormState,
  type MessageOrder,
} from 'nhs-notify-web-template-management-utils';
import { createRoutingConfig } from '@utils/message-plans';
import { $MessagePlanFormData } from '@forms/MessagePlan/schema';

const $CreateMessagePlanFormData = $MessagePlanFormData.extend({
  messageOrder: z.enum(MESSAGE_ORDER_OPTIONS_LIST, {
    error: 'Invalid message order selected',
  }),
});

const INITIAL_CASCADE_ITEMS: Record<Channel, CascadeItem> = {
  NHSAPP: {
    cascadeGroups: ['standard'],
    channel: 'NHSAPP',
    channelType: 'primary',
    defaultTemplateId: null,
  },
  EMAIL: {
    cascadeGroups: ['standard'],
    channel: 'EMAIL',
    channelType: 'primary',
    defaultTemplateId: null,
  },
  SMS: {
    cascadeGroups: ['standard'],
    channel: 'SMS',
    channelType: 'primary',
    defaultTemplateId: null,
  },
  LETTER: {
    cascadeGroups: ['standard'],
    channel: 'LETTER',
    channelType: 'primary',
    defaultTemplateId: null,
  },
};

function messageOrderToInitialCascade(
  messageOrder: MessageOrder
): CascadeItem[] {
  return (
    {
      NHSAPP: [INITIAL_CASCADE_ITEMS['NHSAPP']],
      'NHSAPP,EMAIL': [
        INITIAL_CASCADE_ITEMS['NHSAPP'],
        INITIAL_CASCADE_ITEMS['EMAIL'],
      ],
      'NHSAPP,SMS': [
        INITIAL_CASCADE_ITEMS['NHSAPP'],
        INITIAL_CASCADE_ITEMS['SMS'],
      ],
      'NHSAPP,EMAIL,SMS': [
        INITIAL_CASCADE_ITEMS['NHSAPP'],
        INITIAL_CASCADE_ITEMS['EMAIL'],
        INITIAL_CASCADE_ITEMS['SMS'],
      ],
      'NHSAPP,SMS,EMAIL': [
        INITIAL_CASCADE_ITEMS['NHSAPP'],
        INITIAL_CASCADE_ITEMS['SMS'],
        INITIAL_CASCADE_ITEMS['EMAIL'],
      ],
      'NHSAPP,SMS,LETTER': [
        INITIAL_CASCADE_ITEMS['NHSAPP'],
        INITIAL_CASCADE_ITEMS['SMS'],
        INITIAL_CASCADE_ITEMS['LETTER'],
      ],
      'NHSAPP,EMAIL,SMS,LETTER': [
        INITIAL_CASCADE_ITEMS['NHSAPP'],
        INITIAL_CASCADE_ITEMS['EMAIL'],
        INITIAL_CASCADE_ITEMS['SMS'],
        INITIAL_CASCADE_ITEMS['LETTER'],
      ],
      EMAIL: [INITIAL_CASCADE_ITEMS['EMAIL']],
      LETTER: [INITIAL_CASCADE_ITEMS['LETTER']],
    } satisfies Record<MessageOrder, CascadeItem[]>
  )[messageOrder];
}

export async function createMessagePlanServerAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = $CreateMessagePlanFormData.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!parsed.success) {
    return {
      ...formState,
      errorState: z.flattenError(parsed.error),
    };
  }

  delete formState.errorState;

  const created = await createRoutingConfig({
    name: parsed.data.name,
    campaignId: parsed.data.campaignId,
    cascade: messageOrderToInitialCascade(parsed.data.messageOrder),
    cascadeGroupOverrides: [],
  });

  redirect(`/message-plans/edit-message-plan/${created.id}`, RedirectType.push);
}
