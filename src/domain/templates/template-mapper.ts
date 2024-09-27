import { Session, TemplateType } from '@utils/types';
import { TemplateInput } from './templates.types';

const nhsAppTemplateMap = (session: Session): TemplateInput => ({
  name: session.nhsAppTemplateName,
  type: 'NHS_APP',
  version: 1,
  fields: { content: session.nhsAppTemplateMessage },
});

const smsTemplateMap = (session: Session): TemplateInput => ({
  name: session.smsTemplateName!, // TODO: need to figure this out?
  type: 'SMS',
  version: 1,
  fields: { content: session.smsTemplateMessage! },
});

export function createTemplateFromSession(session: Session): TemplateInput {
  switch (session.templateType) {
    case TemplateType.NHS_APP: {
      return nhsAppTemplateMap(session);
    }
    case TemplateType.SMS: {
      return smsTemplateMap(session);
    }
    default: {
      throw new Error(`Invalid ${session.templateType} template type`);
    }
  }
}
