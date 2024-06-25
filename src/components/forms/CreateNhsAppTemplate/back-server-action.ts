'use server';
import { z } from 'zod';
import { FormState } from '../../../utils/types';
import { zodValidationServerAction } from '../../../utils/zod-validation-server-action';

const formSchema = z.object({
    nhsAppTemplateName: z.string(),
    nhsAppTemplateMessage: z.string(),
});

export const createNhsAppBackServerAction = (formState: FormState, formData: FormData): FormState => 
    zodValidationServerAction(
        formState,
        formData,
        formSchema,
        'choose-template',
    );
