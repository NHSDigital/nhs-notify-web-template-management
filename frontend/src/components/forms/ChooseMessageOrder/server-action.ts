import { redirect, RedirectType } from 'next/navigation';
import { FormState } from 'nhs-notify-web-template-management-utils';
import { z } from 'zod';
import content from '@content/content';

export const MESSAGE_ORDER_OPTIONS_LIST = [
  'NHS_APP',
  'NHS_APP,EMAIL',
  'NHS_APP,SMS',
  'NHS_APP,EMAIL,SMS',
  'NHS_APP,SMS,EMAIL',
  'NHS_APP,SMS,LETTER',
  'NHS_APP,EMAIL,SMS,LETTER',
  'LETTER',
] as const;

export type MessageOrder = (typeof MESSAGE_ORDER_OPTIONS_LIST)[number];

export const $ChooseMessageOrder = z.object({
  messageOrder: z.enum(MESSAGE_ORDER_OPTIONS_LIST, {
    message: content.components.chooseMessageOrder.form.messageOrder.error,
  }),
});

export async function chooseMessageOrderAction(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const parsedForm = $ChooseMessageOrder.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!parsedForm.success) {
    return {
      errorState: z.flattenError(parsedForm.error),
    };
  }

  redirect(
    `/message-plans/create-message-plan?messageOrder=${encodeURIComponent(parsedForm.data.messageOrder)}`,
    RedirectType.push
  );
}
