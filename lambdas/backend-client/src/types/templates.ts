import z from 'zod';
import {
  $EmailTemplateDTO,
  $NHSAppTemplateDTO,
  $SMSTemplateDTO,
} from '../schemas/template-schema';

export type SMSTemplateDTO = z.infer<typeof $SMSTemplateDTO>;
export type NHSAppTemplateDTO = z.infer<typeof $NHSAppTemplateDTO>;
export type EmailTemplateDTO = z.infer<typeof $EmailTemplateDTO>;
