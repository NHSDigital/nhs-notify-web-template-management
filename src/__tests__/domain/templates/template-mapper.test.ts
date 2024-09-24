import { createTemplateFromSession } from '@domain/templates';
import { Session, TemplateType } from '@utils/types';

describe('createTemplateFromSession', () => {
  it('should map session to template', () => {
    const session: Session = {
      nhsAppTemplateMessage: 'message',
      nhsAppTemplateName: 'name',
      id: '',
      templateType: TemplateType.NHS_APP,
    };

    const template = createTemplateFromSession(session);
    expect(template).toEqual({
      name: 'name',
      type: 'NHS_APP',
      version: 1,
      fields: { content: 'message' },
    });
  });

  it('should throw error when templateType is unknown', () => {
    const session: Session = {
      nhsAppTemplateMessage: 'message',
      nhsAppTemplateName: 'name',
      id: '',
      templateType: 'UNKNOWN' as TemplateType,
    };
    expect(() => createTemplateFromSession(session)).toThrow();
  });

  test.each([TemplateType.EMAIL, TemplateType.SMS, TemplateType.LETTER])(
    'should throw error when templateType is is %s',
    (type) => {
      const session: Session = {
        nhsAppTemplateMessage: 'message',
        nhsAppTemplateName: 'name',
        id: '',
        templateType: type,
      };
      expect(() => createTemplateFromSession(session)).toThrow();
    }
  );
});
