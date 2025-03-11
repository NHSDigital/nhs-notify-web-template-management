import { faker } from '@faker-js/faker';
import { CreateTemplatePayload, UpdateTemplatePayload } from '../types';
import {
  pdfLetterMultipart,
  type PdfUploadPartSpec,
} from 'nhs-notify-web-template-management-test-helper-utils';

type TemplatePayload = CreateTemplatePayload | UpdateTemplatePayload;

type OptionalTemplateFields<
  T extends TemplatePayload,
  U = Record<string, unknown>,
> = Partial<T> & U;

type MandatoryTemplateFields<
  T extends TemplatePayload,
  K extends keyof T,
> = Pick<T, K>;

type TemplateInput<T extends TemplatePayload> = MandatoryTemplateFields<
  T,
  'templateType'
> &
  OptionalTemplateFields<T>;

type TemplateOutput<
  T extends TemplatePayload,
  U extends Record<string, unknown>,
> = T & U;

const createTemplateBaseData = (templateType: unknown) => ({
  name: faker.word.noun(),
  message: faker.word.words(5),
  ...(templateType === 'EMAIL' && {
    subject: faker.word.interjection(),
  }),
  ...(templateType === 'LETTER' && {
    language: 'en',
    letterType: 'x0',
  }),
});

export const TemplateAPIPayloadFactory = {
  /**
   * Returns a request body payload to be used with an API request to create a new non-letter template
   */
  getCreateTemplatePayload<T extends TemplateInput<CreateTemplatePayload>>(
    template: T
  ): TemplateOutput<CreateTemplatePayload, T> {
    return {
      ...createTemplateBaseData(template.templateType),
      ...template,
    };
  },

  /**
   * Returns a request body payload to be used with an API request to update a non-letter template
   */
  getUpdateTemplatePayload<T extends TemplateInput<UpdateTemplatePayload>>(
    template: T
  ): TemplateOutput<UpdateTemplatePayload, T> {
    return {
      templateStatus: 'NOT_YET_SUBMITTED',
      ...createTemplateBaseData(template.templateType),
      ...template,
    };
  },

  /**
   * Returns a request body payload to be used with an API request to create a new letter template
   */
  getCreateLetterTemplatePayload<
    T extends TemplateInput<CreateTemplatePayload>,
  >(
    template: T,
    uploadSpec: PdfUploadPartSpec[]
  ): {
    templateData: TemplateOutput<CreateTemplatePayload, T>;
    multipart: Buffer;
    contentType: string;
  } {
    const templateData = {
      ...createTemplateBaseData(template.templateType),
      ...template,
    };

    const multipartData = pdfLetterMultipart(uploadSpec, templateData);

    return {
      templateData,
      ...multipartData,
    };
  },

  /**
   * Returns a request body payload to be used with an API request to update a letter template
   */
  getUpdateLetterTemplatePayload<
    T extends TemplateInput<UpdateTemplatePayload>,
  >(
    template: T,
    uploadSpec: PdfUploadPartSpec[]
  ): {
    templateData: TemplateOutput<UpdateTemplatePayload, T>;
    multipart: Buffer;
    contentType: string;
  } {
    const templateData = {
      templateStatus: 'NOT_YET_SUBMITTED',
      ...createTemplateBaseData(template.templateType),
      ...template,
    };

    const multipartData = pdfLetterMultipart(uploadSpec, templateData);

    return {
      templateData,
      ...multipartData,
    };
  },
};
