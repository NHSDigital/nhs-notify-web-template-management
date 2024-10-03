import { Session, TemplateType } from '@utils/types';
import { TemplateInput } from './templates.types';

const nhsAppTemplateMap = (session: Session): TemplateInput => ({
  name: session.nhsAppTemplateName,
  type: 'NHS_APP',
  version: 1,
  fields: { content: session.nhsAppTemplateMessage },
});

const emailTemplateMap = (session: Session): TemplateInput => ({
  name: session.emailTemplateName!,
  type: 'EMAIL',
  version: 1,
  fields: {
    subjectLine: session.emailTemplateSubjectLine,
    content: session.emailTemplateMessage!,
  },
});

export function createTemplateFromSession(session: Session): TemplateInput {
  switch (session.templateType) {
    case TemplateType.NHS_APP: {
      return nhsAppTemplateMap(session);
    }
    case TemplateType.EMAIL: {
      return emailTemplateMap(session);
    }
    default: {
      throw new Error(`Invalid ${session.templateType} template type`);
    }
  }
}
