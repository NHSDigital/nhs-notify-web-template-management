import { z } from 'zod';
import {
  $AuthoringLetterProperties,
  $CreatePdfLetterProperties,
  $CreateUpdateTemplate,
  $EmailProperties,
  $Language,
  $LetterFiles,
  $PdfLetterProperties,
  $LetterType,
  $NhsAppProperties,
  $SmsProperties,
  $TemplateDto,
  TEMPLATE_STATUS_LIST,
  TemplateDto,
} from 'nhs-notify-backend-client';

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
  $TemplateDto,
  z.object({
    templateStatus: z.literal('SUBMITTED'),
  })
);

export const $NonSubmittedTemplate = z.intersection(
  $TemplateDto,
  z.object({
    templateStatus: z.enum(TEMPLATE_STATUS_LIST).exclude(['SUBMITTED']),
  })
);

export const $CreateNHSAppTemplate = z.intersection(
  $CreateUpdateTemplate,
  $NhsAppProperties
);
export const $NHSAppTemplate = z.intersection($TemplateDto, $NhsAppProperties);
export const $SubmittedNHSAppTemplate = z.intersection(
  $SubmittedTemplate,
  $NHSAppTemplate
);

export const $CreateEmailTemplate = z.intersection(
  $CreateUpdateTemplate,
  $EmailProperties
);

export const $EmailTemplate = z.intersection($TemplateDto, $EmailProperties);

export const $SubmittedEmailTemplate = z.intersection(
  $SubmittedTemplate,
  $EmailTemplate
);

export const $CreateSMSTemplate = z.intersection(
  $CreateUpdateTemplate,
  $SmsProperties
);
export const $SMSTemplate = z.intersection($TemplateDto, $SmsProperties);

export const $SubmittedSMSTemplate = z.intersection(
  $SubmittedTemplate,
  $SMSTemplate
);

export const $UploadLetterTemplate = z.intersection(
  $CreateUpdateTemplate,
  $CreatePdfLetterProperties
);

const $BaseLetterTemplateDto = $TemplateDto.and(
  z.object({
    templateType: z.literal('LETTER'),
  })
);

export const $PdfLetterTemplate = $BaseLetterTemplateDto.and(
  $PdfLetterProperties.extend({ files: $LetterFiles })
);

export const $AuthoringLetterTemplate = $BaseLetterTemplateDto.and(
  $AuthoringLetterProperties
);

export const $LetterTemplate = z.union([
  $PdfLetterTemplate,
  $AuthoringLetterTemplate,
]);

export const $SubmittedLetterTemplate = z.intersection(
  $SubmittedTemplate,
  $LetterTemplate
);

export const $LargePrintLetterTemplate = z.intersection(
  $LetterTemplate,
  z.object({
    letterType: $LetterType.extract(['x1']),
  })
);

export const $ForeignLanguageLetterTemplate = z.intersection(
  $LetterTemplate,
  z.object({
    language: $Language.exclude(['en']),
  })
);

export const validateNHSAppTemplate = (template?: TemplateDto) =>
  zodValidate($NHSAppTemplate, template);

export const validateSMSTemplate = (template?: TemplateDto) =>
  zodValidate($SMSTemplate, template);

export const validateEmailTemplate = (template?: TemplateDto) =>
  zodValidate($EmailTemplate, template);

export const validateLetterTemplate = (template?: TemplateDto) =>
  zodValidate($LetterTemplate, template);

export const validateLargePrintLetterTemplate = (template?: TemplateDto) =>
  zodValidate($LargePrintLetterTemplate, template);

export const validateForeignLanguageLetterTemplate = (template?: TemplateDto) =>
  zodValidate($ForeignLanguageLetterTemplate, template);

export const validateSubmittedEmailTemplate = (template?: TemplateDto) =>
  zodValidate($SubmittedEmailTemplate, template);

export const validateSubmittedSMSTemplate = (template?: TemplateDto) =>
  zodValidate($SubmittedSMSTemplate, template);

export const validateSubmittedNHSAppTemplate = (template?: TemplateDto) =>
  zodValidate($SubmittedNHSAppTemplate, template);

export const validateTemplate = (template?: TemplateDto) =>
  zodValidate($TemplateDto, template);

export const validateSubmittedLetterTemplate = (template?: TemplateDto) =>
  zodValidate($SubmittedLetterTemplate, template);

export const validateNonSubmittedTemplate = (template?: TemplateDto) =>
  zodValidate($NonSubmittedTemplate, template);

export const $GuardDutyMalwareScanStatus = z.enum([
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

// Full event is GuardDutyScanResultNotificationEvent from aws-lambda package
// Just typing/validating the parts we use
export const guardDutyEventValidator = (
  scanResult: 'PASSED' | 'FAILED' | 'ANY' = 'ANY'
) => {
  const $ResultStatusValidator = {
    PASSED: $GuardDutyMalwareScanStatusPassed,
    FAILED: $GuardDutyMalwareScanStatusFailed,
    ANY: $GuardDutyMalwareScanStatus,
  }[scanResult];

  return z.object({
    detail: z.object({
      s3ObjectDetails: z.object({
        objectKey: z.string(),
        versionId: z.string(),
      }),
      scanResultDetails: z.object({
        scanResultStatus: $ResultStatusValidator,
      }),
    }),
  });
};
