/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TemplateType } from './TemplateType';
export type CreateLetterTemplate = {
    template?: {
        templateType: TemplateType;
        name: string;
        letterType?: string;
        language?: string;
        pdfTemplateInputFile?: string;
        testPersonalisationInputFile?: string;
    };
    letterPdf?: Blob;
    personalisationCsv?: string;
};

