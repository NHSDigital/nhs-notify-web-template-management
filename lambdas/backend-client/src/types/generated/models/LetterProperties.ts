/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Language } from './Language';
import type { LetterFiles } from './LetterFiles';
import type { LetterType } from './LetterType';
import { TemplateType } from './TemplateType';
export type LetterProperties = {
    templateType: TemplateType.LETTER
    letterType: LetterType;
    language: Language;
    files: LetterFiles;
};

