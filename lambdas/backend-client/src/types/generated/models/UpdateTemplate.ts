/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TemplateStatus } from './TemplateStatus';
import type { TemplateType } from './TemplateType';
export type UpdateTemplate = {
    templateStatus: TemplateStatus;
    name: string;
    message: string;
    subject?: string;
    /**
     * This value will never be updated. It is used to determine the type of template being validated.
     */
    readonly templateType: TemplateType;
};

