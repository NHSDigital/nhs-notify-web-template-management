import { Language, LetterType } from 'nhs-notify-backend-client';
import {
  languageMapping,
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

  const letterCases: [LetterType | undefined, Language, string][] = [
    [LetterType.STANDARD, Language.ENGLISH, 'Standard letter'],
    [LetterType.STANDARD, Language.BENGALI, 'Additional language letter'],
    [LetterType.BRAILLE, Language.ENGLISH, 'Braille letter'],
    [LetterType.AUDIO, Language.ENGLISH, 'Audio letter'],
    [LetterType.LARGE_PRINT, Language.ENGLISH, 'Large print letter'],
    [LetterType.BSL, Language.ENGLISH, 'British Sign Language letter'],
    [undefined, Language.ENGLISH, 'Standard letter'],
  ];

  test.each(letterCases)(
    'letter type %s and language %s map to %s',
    (letterType, language, expected) => {
      expect(
        templateTypeDisplayMappings(TemplateType.LETTER, letterType, language)
      ).toBe(expected);
    }
  );
});

describe('languageMappings', () => {
  const languageCases: [Language, string][] = [
    [Language.ENGLISH, 'English'],
    [Language.MODERN_GREEK, 'Modern Greek'],
  ];

  test.each(languageCases)('language %s maps to %s', (language, expected) => {
    expect(languageMapping(language)).toBe(expected);
  });
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
