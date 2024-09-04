import { Session, TemplateType } from '@utils/types';
import { NHSAppTemplate } from '../domain/templates/nhsapp-template';

// TODO: maybe not... It's just to show what todo for the next templates. but YAGNI...
export function templateFactory(session: Session) {
  switch (session.templateType) {
    case TemplateType.NHS_APP: {
      return NHSAppTemplate.create(session);
    }
    default: {
      // TODO: need type guard statement...
      throw new Error(`Unknown template type: ${session.templateType}`);
    }
  }
}
