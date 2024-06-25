'use server';
import { z } from 'zod';
import { FormState } from '../../../utils/types';
import { zodValidationServerAction } from '../../../utils/zod-validation-server-action';

const formSchema = z.object({
    nhsAppTemplateName: z.string().min(1, { message: 'Enter a template name'}),
    nhsAppTemplateMessage: z.string().min(1, { message: 'Enter a template message'}),
});

export const createNhsAppBackServerAction = (formState: FormState, formData: FormData): FormState => 
    zodValidationServerAction(
        formState,
        formData,
        formSchema,
        'review-nhs-app-template',
    );
