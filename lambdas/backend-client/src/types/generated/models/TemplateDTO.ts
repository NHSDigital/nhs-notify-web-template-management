/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Language } from './Language';
import type { LetterType } from './LetterType';
import type { TemplateStatus } from './TemplateStatus';
import type { TemplateType } from './TemplateType';
export type TemplateDTO = {
    id: string;
    templateType: TemplateType;
    templateStatus: TemplateStatus;
    letterType?: LetterType;
    language?: Language;
    pdfTemplateInputFile?: string;
    testPersonalisationInputFile?: string;
    name: string;
    message?: string;
    createdAt: string;
    updatedAt: string;
    subject?: string;
};

