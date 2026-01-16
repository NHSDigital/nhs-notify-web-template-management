import { randomUUID } from 'node:crypto';
import {
  renderEmailMarkdown,
  renderNHSAppMarkdown,
  renderSMSMarkdown,
} from '@utils/markdownit';
import { renderTemplateMarkdown } from '@utils/render-template-markdown';
import {
  EmailTemplate,
  LetterTemplate,
  NHSAppTemplate,
  SMSTemplate,
} from 'nhs-notify-web-template-management-utils';

jest.mock('@utils/markdownit');

test('nhsapp template', () => {
  const template: NHSAppTemplate = {
    createdAt: '',
    id: '',
    lockNumber: 0,
    message: randomUUID(),
    name: '',
    templateStatus: 'NOT_YET_SUBMITTED',
    templateType: 'NHS_APP',
    updatedAt: '',
  };

  renderTemplateMarkdown(template);

  expect(renderNHSAppMarkdown).toHaveBeenCalledWith(template.message);
});

test('email template', () => {
  const template: EmailTemplate = {
    createdAt: '',
    id: '',
    lockNumber: 0,
    message: randomUUID(),
    name: '',
    subject: '',
    templateStatus: 'NOT_YET_SUBMITTED',
    templateType: 'EMAIL',
    updatedAt: '',
  };

  renderTemplateMarkdown(template);

  expect(renderEmailMarkdown).toHaveBeenCalledWith(template.message);
});

test('sms template', () => {
  const template: SMSTemplate = {
    createdAt: '',
    id: '',
    lockNumber: 0,
    message: randomUUID(),
    name: '',
    templateStatus: 'NOT_YET_SUBMITTED',
    templateType: 'SMS',
    updatedAt: '',
  };

  renderTemplateMarkdown(template);

  expect(renderSMSMarkdown).toHaveBeenCalledWith(template.message);
});

test('throws error for unsupported template type', () => {
  const template: LetterTemplate = {
    createdAt: '',
    id: '',
    lockNumber: 0,
    name: '',
    templateStatus: 'NOT_YET_SUBMITTED',
    templateType: 'LETTER',
    updatedAt: '',
    language: 'en',
    letterType: 'x0',
    files: {
      pdfTemplate: {
        currentVersion: '',
        fileName: '',
        virusScanStatus: 'PASSED',
      },
    },
  };

  expect(() => renderTemplateMarkdown(template)).toThrow(
    'Unsupported template type'
  );
});
