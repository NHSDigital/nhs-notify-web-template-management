import { Language, LetterType } from 'nhs-notify-backend-client';
import {
  letterTypeDisplayMappings,
  previewTemplatePages,
  TemplateStatus,
  templateStatusToDisplayMappings,
  TemplateType,
  templateTypeDisplayMappings,
  templateTypeToUrlTextMappings,
  viewSubmittedTemplatePages,
} from '../enum';

describe('templateTypeDisplayMappings', () => {
  test('NHS_APP', () => {
    expect(templateTypeDisplayMappings(TemplateType.NHS_APP)).toEqual(
      'NHS App message'
    );
  });

  test('SMS', () => {
    expect(templateTypeDisplayMappings(TemplateType.SMS)).toEqual(
      'Text message (SMS)'
    );
  });

  test('EMAIL', () => {
    expect(templateTypeDisplayMappings(TemplateType.EMAIL)).toEqual('Email');
  });

  test('LETTER', () => {
    expect(templateTypeDisplayMappings(TemplateType.LETTER)).toEqual('Letter');
  });
});

describe('letterTypeDisplayMappings', () => {
  const letterCases: [LetterType, Language, string][] = [
    [LetterType.X0, Language.EN, 'Standard letter'],
    [LetterType.X0, Language.BN, 'Letter - Bengali'],
    [LetterType.X0, Language.EL, 'Letter - Greek'],
    [LetterType.Q1, Language.EN, 'Braille letter'],
    [LetterType.X3, Language.EN, 'Audio CD letter'],
    [LetterType.X1, Language.EN, 'Large print letter'],
    [LetterType.Q4, Language.EN, 'British Sign Language letter'],
  ];

  test.each(letterCases)(
    'letter type %s and language %s map to %s',
    (letterType, language, expected) => {
      expect(letterTypeDisplayMappings(letterType, language)).toBe(expected);
    }
  );
});

describe('templateStatusToDisplayMappings', () => {
  test('NOT_YET_SUBMITTED', () => {
    expect(
      templateStatusToDisplayMappings(TemplateStatus.NOT_YET_SUBMITTED)
    ).toEqual('Not yet submitted');
  });

  test('SUBMITTED', () => {
    expect(templateStatusToDisplayMappings(TemplateStatus.SUBMITTED)).toEqual(
      'Submitted'
    );
  });

  test('DELETED', () => {
    expect(templateStatusToDisplayMappings(TemplateStatus.DELETED)).toEqual('');
  });
});

describe('templateTypeToUrlTextMappings', () => {
  test('NHS_APP', () => {
    expect(templateTypeToUrlTextMappings(TemplateType.NHS_APP)).toEqual(
      'nhs-app'
    );
  });

  test('SMS', () => {
    expect(templateTypeToUrlTextMappings(TemplateType.SMS)).toEqual(
      'text-message'
    );
  });

  test('EMAIL', () => {
    expect(templateTypeToUrlTextMappings(TemplateType.EMAIL)).toEqual('email');
  });
});

describe('previewTemplatePages', () => {
  test('NHS_APP', () => {
    expect(previewTemplatePages(TemplateType.NHS_APP)).toEqual(
      'preview-nhs-app-template'
    );
  });

  test('SMS', () => {
    expect(previewTemplatePages(TemplateType.SMS)).toEqual(
      'preview-text-message-template'
    );
  });

  test('EMAIL', () => {
    expect(previewTemplatePages(TemplateType.EMAIL)).toEqual(
      'preview-email-template'
    );
  });
});

describe('viewSubmittedTemplatePages', () => {
  test('NHS_APP', () => {
    expect(viewSubmittedTemplatePages(TemplateType.NHS_APP)).toEqual(
      'view-submitted-nhs-app-template'
    );
  });

  test('SMS', () => {
    expect(viewSubmittedTemplatePages(TemplateType.SMS)).toEqual(
      'view-submitted-text-message-template'
    );
  });

  test('EMAIL', () => {
    expect(viewSubmittedTemplatePages(TemplateType.EMAIL)).toEqual(
      'view-submitted-email-template'
    );
  });
});
