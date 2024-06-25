'use server';
import { z } from 'zod';
import { FormState, FormId } from '../../utils/types';
import { chooseTemplateContinueServerAction } from '../../components/forms/ChooseTemplate/continue-server-action';
import { createNhsAppBackServerAction } from '../../components/forms/CreateNhsAppTemplate/back-server-action';
import { createNhsAppContinueServerAction } from '../../components/forms/CreateNhsAppTemplate/continue-server-action';

const serverActions: Partial<Record<FormId, (formState: FormState, formData: FormData) => FormState>> = {
    'choose-template': chooseTemplateContinueServerAction,
    'create-nhs-app-template-back': createNhsAppBackServerAction,
    'create-nhs-app-template': createNhsAppContinueServerAction
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
