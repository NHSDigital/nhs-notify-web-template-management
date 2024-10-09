import { createTemplateFromSession } from '@domain/templates';
import { Session, TemplateType } from '@utils/types';

describe('createTemplateFromSession', () => {
  it('should map session nhs-app to template', () => {
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

  it('should map session sms to template', () => {
    const session: Session = {
      nhsAppTemplateMessage: 'message',
      nhsAppTemplateName: 'name',
      smsTemplateMessage: 'sms-message',
      smsTemplateName: 'sms-name',
      id: '',
      templateType: TemplateType.SMS,
    };

    const template = createTemplateFromSession(session);
    expect(template).toEqual({
      name: 'sms-name',
      type: 'SMS',
      version: 1,
      fields: { content: 'sms-message' },
    });
  });

  it('should map session email to template', () => {
    const session: Session = {
      nhsAppTemplateMessage: 'message',
      nhsAppTemplateName: 'name',
      emailTemplateMessage: 'email-message',
      emailTemplateSubjectLine: 'email-subject-line',
      emailTemplateName: 'email-name',
      id: '',
      templateType: TemplateType.EMAIL,
    };

    const template = createTemplateFromSession(session);
    expect(template).toEqual({
      name: 'email-name',
      type: 'EMAIL',
      version: 1,
      fields: {
        subjectLine: 'email-subject-line',
        content: 'email-message',
      },
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

  test.each([TemplateType.LETTER])(
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
