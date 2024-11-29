/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TemplateStatus } from './TemplateStatus';
import type { TemplateType } from './TemplateType';
export type UpdateTemplate = {
    id: string;
    status: TemplateStatus;
    name: string;
    message: string;
    subject?: string;
    /**
     * The API will never update this value on an update
     */
    readonly type: TemplateType;
};

