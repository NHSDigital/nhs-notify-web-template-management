'use server';
import { z } from 'zod';
import { FormState, FormId } from '../../utils/types';
import { zodValidationServerAction } from '../../utils/zod-validation-server-action';

const serverActions: Partial<Record<FormId, (formState: FormState, formData: FormData) => FormState>> = {
    'choose-template': (formState: FormState, formData: FormData) => zodValidationServerAction(
        formState,
        formData,
        z.object({
            'page': z.enum(
                ['create-sms-template', 'create-email-template', 'create-nhs-app-template', 'create-letter-template'],
                { message: 'Select a template type' },
            )
        }),
    ),
    'create-nhs-app-template-back': (formState: FormState, formData: FormData) => zodValidationServerAction(
        formState,
        formData,
        z.object({
            nhsAppTemplateName: z.string(),
            nhsAppTemplateMessage: z.string(),
        }),
        'choose-template',
    ),
    'create-nhs-app-template': (formState: FormState, formData: FormData) => zodValidationServerAction(
        formState,
        formData,
        z.object({
            nhsAppTemplateName: z.string().min(1, { message: 'Enter a template name'}),
            nhsAppTemplateMessage: z.string().min(1, { message: 'Enter a template message'}),
        }),
        'review-nhs-app-template',
    )
};

const schema = z.object({
    'form-id': z.enum(['choose-template', 'create-nhs-app-template-back',  'create-nhs-app-template'])
});

export const mainServerAction = (formState: FormState, formData: FormData): FormState => {
    console.log(Object.fromEntries([...formData.entries()]))
    const formId = formData.get('form-id');

    const parsedFormId = schema.safeParse({ 'form-id': formId });

    if (!parsedFormId.success) {
        return {
            ...formState,
            validationError: parsedFormId.error.flatten(),
        };
    }
    
    const serverAction = serverActions[parsedFormId.data['form-id']];

    if (!serverAction) {
        return formState;
    }

    return serverAction(formState, formData);
}
