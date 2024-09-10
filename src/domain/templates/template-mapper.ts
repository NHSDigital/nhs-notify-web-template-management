import { Session, TemplateType } from '@utils/types';
import { NHSAppTemplate, Template } from './templates.types';

const nhsAppTemplateMap = (session: Session): NHSAppTemplate => ({
  name: session.nhsAppTemplateName,
  type: 'NHS_APP',
  version: 1,
  fields: { content: session.nhsAppTemplateMessage },
});

export function createTemplateFromSession(session: Session): Template {
  switch (session.templateType) {
    case TemplateType.NHS_APP: {
      return nhsAppTemplateMap(session);
    }
    default: {
      throw new Error(`Invalid ${session.templateType} template type`);
    }
  }
}
