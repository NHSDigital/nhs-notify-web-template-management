import { templateFromSessionMapper } from '@domain/templates';
import { Session, TemplateType } from '@utils/types';

describe('templateFromSessionMapper', () => {
  it('should map session to template', () => {
    const session: Session = {
      nhsAppTemplateMessage: 'message',
      nhsAppTemplateName: 'name',
      id: '',
      templateType: TemplateType.NHS_APP,
    };

    const template = templateFromSessionMapper(TemplateType.NHS_APP, session);
    expect(template).toEqual({
      name: 'name',
      type: 'NHS_APP',
      version: 1,
      fields: { body: 'message' },
    });
  });

  test.each([TemplateType.EMAIL, TemplateType.SMS, TemplateType.LETTER])(
    'should throw not error',
    (type) => {
      const session: Session = {
        nhsAppTemplateMessage: 'message',
        nhsAppTemplateName: 'name',
        id: '',
        templateType: TemplateType.NHS_APP,
      };
      expect(() => templateFromSessionMapper(type, session)).toThrow();
    }
  );
});
