import { Session, TemplateType } from '@utils/types';
import { NHSAppTemplate, Template } from './templates.types';

const nhsTemplateFactory = (session: Session): NHSAppTemplate => ({
  name: session.nhsAppTemplateName,
  type: 'NHS_APP',
  version: 1,
  fields: { body: session.nhsAppTemplateMessage },
});

const factoryMap: Record<TemplateType, (session: Session) => Template> = {
  [TemplateType.NHS_APP]: nhsTemplateFactory,
  [TemplateType.SMS]: () => {
    throw new Error('Not implemented');
  },
  [TemplateType.EMAIL]: () => {
    throw new Error('Not implemented');
  },
  [TemplateType.LETTER]: () => {
    throw new Error('Not implemented');
  },
};

export function templateFromSessionMapper(
  type: TemplateType,
  session: Session
) {
  return factoryMap[type](session);
}
