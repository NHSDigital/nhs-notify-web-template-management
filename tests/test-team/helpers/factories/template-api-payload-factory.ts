import { faker } from '@faker-js/faker';
import {
  CreateTemplate,
  TemplateStatus,
  TemplateType,
  UpdateTemplate,
} from 'nhs-notify-backend-client';

type CreateTemplatePayload = Omit<CreateTemplate, 'templateType'> & {
  templateType: string;
};
type UpdateTemplatePayload = Omit<
  UpdateTemplate,
  'templateType' | 'templateStatus'
> & {
  templateType: string;
  templateStatus: string;
};

type TemplatePayload = CreateTemplatePayload | UpdateTemplatePayload;

type OptionalTemplateFields<
  T extends TemplatePayload,
  U = Record<string, unknown>,
> = Partial<T> & U;

type MandatoryTemplateFields<
  T extends TemplatePayload,
  K extends keyof T,
> = Pick<T, K>;

type Input<T extends TemplatePayload> = MandatoryTemplateFields<
  T,
  'templateType'
> &
  OptionalTemplateFields<T>;

type Output<T extends TemplatePayload, U extends Record<string, unknown>> = T &
  U;

const createPayloadData = (templateType: unknown) => ({
  name: faker.word.noun(),
  message: faker.word.words(5),
  ...(templateType === 'EMAIL' && {
    subject: faker.word.interjection(),
  }),
});

export const TemplateAPIPayloadFactory = {
  /**
   * Returns a request body payload to be used with an API request to create a new template
   */
  getCreateTemplatePayload<T extends Input<CreateTemplatePayload>>(
    template: T
  ): Output<CreateTemplatePayload, T> {
    return {
      ...createPayloadData(template.templateType),
      ...template,
    };
  },

  /**
   * Returns a request body payload to be used with an API request to update a template
   */
  getUpdateTemplatePayload<T extends Input<UpdateTemplatePayload>>(
    template: T
  ): Output<UpdateTemplatePayload, T> {
    return {
      templateStatus: 'NOT_YET_SUBMITTED',
      ...createPayloadData(template.templateType),
      ...template,
    };
  },
};
