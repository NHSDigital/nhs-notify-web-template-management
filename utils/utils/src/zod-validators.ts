import { z } from 'zod';
import {
  $CreateLetterPropertiesWithType,
  $CreateUpdateTemplate,
  $EmailPropertiesWithType,
  $LetterFiles,
  $LetterPropertiesWithType,
  $NhsAppPropertiesWithType,
  $SmsPropertiesWithType,
  $TemplateDtoSchema,
  TemplateDto,
} from 'nhs-notify-backend-client';
import { GuardDutyMalwareScanStatus } from './types';

export const zodValidate = <T extends z.Schema>(
  schema: T,
  obj: unknown
): z.infer<T> | undefined => {
  try {
    return schema.parse(obj);
  } catch {
    return undefined;
  }
};

export const $SubmittedTemplate = z.intersection(
  $TemplateDtoSchema,
  z.object({
    templateStatus: z.literal('SUBMITTED'),
  })
);

export const $NonSubmittedTemplate = z.intersection(
  $TemplateDtoSchema,
  z.object({
    templateStatus: z.literal('NOT_YET_SUBMITTED'),
  })
);

export const $CreateNHSAppTemplate = z.intersection(
  $CreateUpdateTemplate,
  $NhsAppPropertiesWithType
);
export const $NHSAppTemplate = z.intersection(
  $TemplateDtoSchema,
  $NhsAppPropertiesWithType
);
export const $SubmittedNHSAppTemplate = z.intersection(
  $SubmittedTemplate,
  $NHSAppTemplate
);

export const $CreateEmailTemplate = z.intersection(
  $CreateUpdateTemplate,
  $EmailPropertiesWithType
);
export const $EmailTemplate = z.intersection(
  $TemplateDtoSchema,
  $EmailPropertiesWithType
);
export const $SubmittedEmailTemplate = z.intersection(
  $SubmittedTemplate,
  $EmailTemplate
);

export const $CreateSMSTemplate = z.intersection(
  $CreateUpdateTemplate,
  $SmsPropertiesWithType
);
export const $SMSTemplate = z.intersection(
  $TemplateDtoSchema,
  $SmsPropertiesWithType
);
export const $SubmittedSMSTemplate = z.intersection(
  $SubmittedTemplate,
  $SMSTemplate
);

export const $CreateLetterTemplate = z.intersection(
  $CreateUpdateTemplate,
  $CreateLetterPropertiesWithType
);
export const $LetterTemplate = z.intersection(
  $TemplateDtoSchema,
  $LetterPropertiesWithType.extend({ files: $LetterFiles })
);
export const $SubmittedLetterTemplate = z.intersection(
  $SubmittedTemplate,
  $LetterTemplate
);

export const validateNHSAppTemplate = (template?: TemplateDto) =>
  zodValidate($NHSAppTemplate, template);

export const validateSMSTemplate = (template?: TemplateDto) =>
  zodValidate($SMSTemplate, template);

export const validateEmailTemplate = (template?: TemplateDto) =>
  zodValidate($EmailTemplate, template);

export const validateLetterTemplate = (template?: TemplateDto) =>
  zodValidate($LetterTemplate, template);

export const validateSubmittedEmailTemplate = (template?: TemplateDto) =>
  zodValidate($SubmittedEmailTemplate, template);

export const validateSubmittedSMSTemplate = (template?: TemplateDto) =>
  zodValidate($SubmittedSMSTemplate, template);

export const validateSubmittedNHSAppTemplate = (template?: TemplateDto) =>
  zodValidate($SubmittedNHSAppTemplate, template);

export const validateTemplate = (template?: TemplateDto) =>
  zodValidate($TemplateDtoSchema, template);

export const validateNonSubmittedTemplate = (template?: TemplateDto) =>
  zodValidate($NonSubmittedTemplate, template);

export const $GuardDutyMalwareScanStatus = z.enum<
  GuardDutyMalwareScanStatus,
  [
    'NO_THREATS_FOUND',
    'THREATS_FOUND',
    'UNSUPPORTED',
    'ACCESS_DENIED',
    'FAILED',
  ]
>([
  'NO_THREATS_FOUND',
  'THREATS_FOUND',
  'UNSUPPORTED',
  'ACCESS_DENIED',
  'FAILED',
]);

export const $GuardDutyMalwareScanStatusFailed =
  $GuardDutyMalwareScanStatus.exclude(['NO_THREATS_FOUND']);

export const $GuardDutyMalwareScanStatusPassed =
  $GuardDutyMalwareScanStatus.extract(['NO_THREATS_FOUND']);
