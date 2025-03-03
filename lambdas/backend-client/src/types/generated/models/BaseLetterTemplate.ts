/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseTemplate } from './BaseTemplate';
import type { Files } from './Files';
import type { Language } from './Language';
import type { LetterType } from './LetterType';
export type BaseLetterTemplate = (BaseTemplate & {
    letterType: LetterType;
    language: Language;
    files: Files;
});

