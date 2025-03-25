// This file is auto-generated by @hey-api/openapi-ts

export type TemplateType = 'NHS_APP' | 'EMAIL' | 'SMS' | 'LETTER';

export type TemplateStatus =
  | 'NOT_YET_SUBMITTED'
  | 'SUBMITTED'
  | 'DELETED'
  | 'PENDING_UPLOAD'
  | 'PENDING_VALIDATION';

export type Language =
  | 'ar'
  | 'bg'
  | 'bn'
  | 'de'
  | 'el'
  | 'en'
  | 'es'
  | 'fa'
  | 'fr'
  | 'gu'
  | 'hi'
  | 'hu'
  | 'it'
  | 'ku'
  | 'lt'
  | 'lv'
  | 'ne'
  | 'pa'
  | 'pl'
  | 'pt'
  | 'ro'
  | 'ru'
  | 'sk'
  | 'so'
  | 'sq'
  | 'ta'
  | 'tr'
  | 'ur'
  | 'zh';

export type LetterType = 'q1' | 'q4' | 'x0' | 'x1' | 'x3';

export type VirusScanStatus = 'PENDING' | 'FAILED' | 'PASSED';

export type FileDetails = {
  fileName: string;
  currentVersion: string;
  virusScanStatus: VirusScanStatus;
};

export type LetterFiles = {
  pdfTemplate: FileDetails;
  testDataCsv?: FileDetails;
  proofs?: Array<FileDetails>;
};

export type NhsAppProperties = {
  message: string;
};

export type EmailProperties = {
  message: string;
  subject: string;
};

export type SmsProperties = {
  message: string;
};

export type CreateLetterProperties = {
  letterType: LetterType;
  language: Language;
};

export type LetterProperties = CreateLetterProperties & {
  files: LetterFiles;
};

export type BaseTemplate = {
  templateType: TemplateType;
  name: string;
};

export type CreateTemplate = BaseTemplate &
  (NhsAppProperties | EmailProperties | SmsProperties | CreateLetterProperties);

export type UpdateTemplate = BaseTemplate & {
  templateStatus: TemplateStatus;
} & (
    | NhsAppProperties
    | EmailProperties
    | SmsProperties
    | CreateLetterProperties
  );

export type UpdateStatus = {
  templateStatus: TemplateStatus;
};

export type TemplateDto = BaseTemplate & {
  id: string;
  templateStatus: TemplateStatus;
  createdAt: string;
  updatedAt: string;
} & (NhsAppProperties | EmailProperties | SmsProperties | LetterProperties);

export type Success = {
  template: TemplateDto;
  statusCode: number;
};

export type SuccessList = {
  templates: Array<TemplateDto>;
  statusCode: number;
};

export type Failure = {
  technicalMessage: string;
  statusCode: number;
  details?: unknown;
};

export type DeleteV1TemplateByTemplateIdData = {
  body?: never;
  path: {
    /**
     * ID of template to update
     */
    templateId: string;
  };
  query?: never;
  url: '/v1/template/{templateId}';
};

export type DeleteV1TemplateByTemplateIdErrors = {
  /**
   * Error
   */
  default: Failure;
};

export type DeleteV1TemplateByTemplateIdError =
  DeleteV1TemplateByTemplateIdErrors[keyof DeleteV1TemplateByTemplateIdErrors];

export type DeleteV1TemplateByTemplateIdResponses = {
  /**
   * 200 response
   */
  200: Success;
};

export type DeleteV1TemplateByTemplateIdResponse =
  DeleteV1TemplateByTemplateIdResponses[keyof DeleteV1TemplateByTemplateIdResponses];

export type GetV1TemplateByTemplateIdData = {
  body?: never;
  path: {
    /**
     * ID of template to return
     */
    templateId: string;
  };
  query?: never;
  url: '/v1/template/{templateId}';
};

export type GetV1TemplateByTemplateIdErrors = {
  /**
   * Error
   */
  default: Failure;
};

export type GetV1TemplateByTemplateIdError =
  GetV1TemplateByTemplateIdErrors[keyof GetV1TemplateByTemplateIdErrors];

export type GetV1TemplateByTemplateIdResponses = {
  /**
   * 200 response
   */
  200: Success;
};

export type GetV1TemplateByTemplateIdResponse =
  GetV1TemplateByTemplateIdResponses[keyof GetV1TemplateByTemplateIdResponses];

export type PostV1TemplateByTemplateIdData = {
  /**
   * Template to update
   */
  body: UpdateTemplate;
  path: {
    /**
     * ID of template to update
     */
    templateId: string;
  };
  query?: never;
  url: '/v1/template/{templateId}';
};

export type PostV1TemplateByTemplateIdErrors = {
  /**
   * Error
   */
  default: Failure;
};

export type PostV1TemplateByTemplateIdError =
  PostV1TemplateByTemplateIdErrors[keyof PostV1TemplateByTemplateIdErrors];

export type PostV1TemplateByTemplateIdResponses = {
  /**
   * 200 response
   */
  200: Success;
};

export type PostV1TemplateByTemplateIdResponse =
  PostV1TemplateByTemplateIdResponses[keyof PostV1TemplateByTemplateIdResponses];

export type PostV1TemplateData = {
  /**
   * Template to create
   */
  body: CreateTemplate;
  path?: never;
  query?: never;
  url: '/v1/template';
};

export type PostV1TemplateErrors = {
  /**
   * Error
   */
  default: Failure;
};

export type PostV1TemplateError =
  PostV1TemplateErrors[keyof PostV1TemplateErrors];

export type PostV1TemplateResponses = {
  /**
   * 201 response
   */
  201: Success;
};

export type PostV1TemplateResponse =
  PostV1TemplateResponses[keyof PostV1TemplateResponses];

export type PostV1LetterTemplateData = {
  /**
   * Letter template to create
   */
  body: unknown;
  path?: never;
  query?: never;
  url: '/v1/letter-template';
};

export type PostV1LetterTemplateErrors = {
  /**
   * Error
   */
  default: Failure;
};

export type PostV1LetterTemplateError =
  PostV1LetterTemplateErrors[keyof PostV1LetterTemplateErrors];

export type PostV1LetterTemplateResponses = {
  /**
   * 201 response
   */
  201: Success;
};

export type PostV1LetterTemplateResponse =
  PostV1LetterTemplateResponses[keyof PostV1LetterTemplateResponses];

export type GetV1TemplatesData = {
  body?: never;
  path?: never;
  query?: never;
  url: '/v1/templates';
};

export type GetV1TemplatesErrors = {
  /**
   * Error
   */
  default: Failure;
};

export type GetV1TemplatesError =
  GetV1TemplatesErrors[keyof GetV1TemplatesErrors];

export type GetV1TemplatesResponses = {
  /**
   * 200 response
   */
  200: SuccessList;
};

export type GetV1TemplatesResponse =
  GetV1TemplatesResponses[keyof GetV1TemplatesResponses];

export type PatchV1TemplateByTemplateIdSubmitData = {
  body?: never;
  path: {
    /**
     * ID of template to update
     */
    templateId: string;
  };
  query?: never;
  url: '/v1/template/{templateId}/submit';
};

export type PatchV1TemplateByTemplateIdSubmitErrors = {
  /**
   * Error
   */
  default: Failure;
};

export type PatchV1TemplateByTemplateIdSubmitError =
  PatchV1TemplateByTemplateIdSubmitErrors[keyof PatchV1TemplateByTemplateIdSubmitErrors];

export type PatchV1TemplateByTemplateIdSubmitResponses = {
  /**
   * 200 response
   */
  200: Success;
};

export type PatchV1TemplateByTemplateIdSubmitResponse =
  PatchV1TemplateByTemplateIdSubmitResponses[keyof PatchV1TemplateByTemplateIdSubmitResponses];

export type ClientOptions = {
  baseUrl: `${string}://${string}` | (string & {});
};
