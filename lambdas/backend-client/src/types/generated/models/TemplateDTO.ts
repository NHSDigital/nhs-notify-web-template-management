/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TemplateStatus } from './TemplateStatus';
import type { TemplateType } from './TemplateType';
export type TemplateDTO = {
    id: string;
    type: TemplateType;
    status: TemplateStatus;
    name: string;
    message: string;
    createdAt: string;
    updatedAt: string;
    subject?: string;
};

