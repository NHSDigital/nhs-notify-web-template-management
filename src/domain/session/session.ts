import { z } from 'zod';

type Types = 'UNKNOWN' | 'NHS_APP' | 'SMS' | 'EMAIL' | 'LETTER';

type SessionData = {
  readonly id: string;
  readonly templateType: Types;
  readonly nhsAppTemplateName?: string;
  readonly nhsAppTemplateMessage?: string;
  readonly smsTemplateName?: string;
  readonly smsTemplateMessage?: string;
};

export class Session {
  private constructor(
    public readonly id: string,
    public readonly templateType: Types,
    public readonly nhsAppTemplateName?: string,
    public readonly nhsAppTemplateMessage?: string,
    public readonly smsTemplateName?: string,
    public readonly smsTemplateMessage?: string
  ) {}

  toPrimitive(): SessionData {
    return {
      id: this.id,
      templateType: this.templateType,
      nhsAppTemplateName: this.nhsAppTemplateName,
      nhsAppTemplateMessage: this.nhsAppTemplateMessage,
      smsTemplateName: this.smsTemplateName,
      smsTemplateMessage: this.smsTemplateMessage,
    };
  }

  validate() {
    const $NHSAppSessionSchema = z.object({
      id: z.string(),
      templateType: z.literal('NHS_APP'),
      nhsAppTemplateName: z.string(),
      nhsAppTemplateMessage: z.string(),
    });

    const $SMSSessionSchema = z.object({
      id: z.string(),
      templateType: z.literal('SMS'),
      smsTemplateName: z.string(),
      smsTemplateNameMessage: z.string(),
    });

    const $SessionSchema = z.discriminatedUnion('templateType', [
      $NHSAppSessionSchema,
      $SMSSessionSchema,
    ]);

    const { data, error, success } = $SessionSchema.safeParse(
      this.toPrimitive()
    );

    if (!success) {
      throw new Error('validation failed', error);
    }

    return data satisfies SessionData;
  }

  static create(data: SessionData) {
    return new Session(
      data.id,
      data.templateType,
      data.nhsAppTemplateName,
      data.nhsAppTemplateMessage,
      data.smsTemplateName,
      data.smsTemplateMessage
    );
  }
}
