import { FC } from 'react';

export type Page = 'choose-template' | 'create-nhs-app-template' | 'create-email-template' | 'create-letter-template' | 'create-sms-template' | 'review-nhs-app-template';
export type FormId = Page | 'create-nhs-app-template-back';

export type FormState = {
    page: Page,
    validationError: FormErrorState | null;
    nhsAppTemplateName: string;
    nhsAppTemplateMessage: string;
};

export type FormErrorState = {
    formErrors: string[];
    fieldErrors: Record<string, string[]>;
};

export type PageComponentProps = { state: FormState, action: (payload: FormData) => void};