/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Language } from './Language';
import type { LetterType } from './LetterType';
import type { TemplateStatus } from './TemplateStatus';
import type { TemplateType } from './TemplateType';
export type UpdateTemplate = {
    templateStatus: TemplateStatus;
    name: string;
    message?: string;
    subject?: string;
    letterType?: LetterType;
    language?: Language;
    /**
     * This value will never be updated. It is used to determine the type of template being validated.
     */
    readonly templateType: TemplateType;
};

