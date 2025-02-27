/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Language } from './Language';
import type { LetterType } from './LetterType';
import type { TemplateType } from './TemplateType';
export type CreateTemplate = {
    templateType: TemplateType;
    name: string;
    message?: string;
    subject?: string;
    letterType?: LetterType;
    language?: Language;
};

