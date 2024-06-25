'use server';
import { z } from 'zod';
import { FormState } from '../../../utils/types';
import { zodValidationServerAction } from '../../../utils/zod-validation-server-action';

const formSchema = z.object({
    'page': z.enum(
        ['create-sms-template', 'create-email-template', 'create-nhs-app-template', 'create-letter-template'],
        { message: 'Select a template type' },
    )
});

export const chooseTemplateContinueServerAction = (formState: FormState, formData: FormData): FormState => 
    zodValidationServerAction(
        formState,
        formData,
        formSchema,
    );
