import { $TemplateSchema } from '@domain/templates/templates.types';

type Types = 'UNKNOWN' | 'NHS_APP' | 'SMS' | 'EMAIL' | 'LETTER';

type SessionData = {
  readonly id: string;
  readonly templateType: Types;
  readonly nhsAppTemplateName?: string;
  readonly nhsAppTemplateMessage?: string;
};

export class Session {
  public readonly id: string;

  public readonly templateType: Types;

  public readonly nhsAppTemplateName?: string;

  public readonly nhsAppTemplateMessage?: string;

  private constructor(
    id: string,
    templateType: Types,
    nhsAppTemplateName?: string,
    nhsAppTemplateMessage?: string
  ) {
    this.id = id;
    this.templateType = templateType;
    this.nhsAppTemplateName = nhsAppTemplateName;
    this.nhsAppTemplateMessage = nhsAppTemplateMessage;
  }

  static create(data: SessionData) {
    return new Session(
      data.id,
      data.templateType,
      data.nhsAppTemplateName,
      data.nhsAppTemplateMessage
    );
  }

  static validate(data: SessionData) {
    $TemplateSchema.parse(data);
  }
}
