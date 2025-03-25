import { Language, LetterType } from 'nhs-notify-backend-client';
import {
  alphabeticalLanguageList,
  alphabeticalLetterTypeList,
  letterTypeDisplayMappings,
  previewTemplatePages,
  templateStatusToDisplayMappings,
  templateTypeDisplayMappings,
  templateTypeToUrlTextMappings,
  viewSubmittedTemplatePages,
} from '../enum';

describe('templateTypeDisplayMappings', () => {
  test('NHS_APP', () => {
    expect(templateTypeDisplayMappings('NHS_APP')).toEqual('NHS App message');
  });

  test('SMS', () => {
    expect(templateTypeDisplayMappings('SMS')).toEqual('Text message (SMS)');
  });

  test('EMAIL', () => {
    expect(templateTypeDisplayMappings('EMAIL')).toEqual('Email');
  });

  test('LETTER', () => {
    expect(templateTypeDisplayMappings('LETTER')).toEqual('Letter');
  });
});

describe('letterTypeDisplayMappings', () => {
  const letterCases: [LetterType, Language, string][] = [
    ['x0', 'en', 'Standard letter'],
    ['x0', 'bn', 'Letter - Bengali'],
    ['x0', 'el', 'Letter - Greek'],
    ['q1', 'en', 'Braille letter'],
    ['x3', 'en', 'Audio CD letter'],
    ['x1', 'en', 'Large print letter'],
    ['q4', 'en', 'British Sign Language letter'],
  ];

  test.each(letterCases)(
    'letter type %s and language %s map to %s',
    (letterType, language, expected) => {
      expect(letterTypeDisplayMappings(letterType, language)).toBe(expected);
    }
  );
});

describe('alphabeticalLetterTypeList', () => {
  test('Alphabetical letter type list produced', () => {
    expect(alphabeticalLetterTypeList).toEqual([
      ['x3', 'Audio CD'],
      ['q1', 'Braille'],
      ['q4', 'British Sign Language'],
      ['x1', 'Large print'],
      ['x0', 'Standard'],
    ]);
  });
});

describe('alphabeticalLanguageList', () => {
  test('Alphabetical language list produced', () => {
    expect(alphabeticalLanguageList).toEqual([
      ['sq', 'Albanian'],
      ['ar', 'Arabic'],
      ['bn', 'Bengali'],
      ['bg', 'Bulgarian'],
      ['zh', 'Chinese'],
      ['en', 'English'],
      ['fr', 'French'],
      ['de', 'German'],
      ['el', 'Greek'],
      ['gu', 'Gujurati'],
      ['hi', 'Hindi'],
      ['hu', 'Hungarian'],
      ['it', 'Italian'],
      ['ku', 'Kurdish'],
      ['lv', 'Latvian'],
      ['lt', 'Lithuanian'],
      ['ne', 'Nepali'],
      ['fa', 'Persian'],
      ['pl', 'Polish'],
      ['pt', 'Portuguese'],
      ['pa', 'Punjabi'],
      ['ro', 'Romanian'],
      ['ru', 'Russian'],
      ['sk', 'Slovak'],
      ['so', 'Somali'],
      ['es', 'Spanish'],
      ['ta', 'Tamil'],
      ['tr', 'Turkish'],
      ['ur', 'Urdu'],
    ]);
  });
});

describe('templateStatusToDisplayMappings', () => {
  test('NOT_YET_SUBMITTED', () => {
    expect(templateStatusToDisplayMappings('NOT_YET_SUBMITTED')).toEqual(
      'Not yet submitted'
    );
  });

  test('SUBMITTED', () => {
    expect(templateStatusToDisplayMappings('SUBMITTED')).toEqual('Submitted');
  });

  test('DELETED', () => {
    expect(templateStatusToDisplayMappings('DELETED')).toEqual('');
  });
});

describe('templateTypeToUrlTextMappings', () => {
  test('NHS_APP', () => {
    expect(templateTypeToUrlTextMappings('NHS_APP')).toEqual('nhs-app');
  });

  test('SMS', () => {
    expect(templateTypeToUrlTextMappings('SMS')).toEqual('text-message');
  });

  test('EMAIL', () => {
    expect(templateTypeToUrlTextMappings('EMAIL')).toEqual('email');
  });
});

describe('previewTemplatePages', () => {
  test('NHS_APP', () => {
    expect(previewTemplatePages('NHS_APP')).toEqual('preview-nhs-app-template');
  });

  test('SMS', () => {
    expect(previewTemplatePages('SMS')).toEqual(
      'preview-text-message-template'
    );
  });

  test('EMAIL', () => {
    expect(previewTemplatePages('EMAIL')).toEqual('preview-email-template');
  });
});

describe('viewSubmittedTemplatePages', () => {
  test('NHS_APP', () => {
    expect(viewSubmittedTemplatePages('NHS_APP')).toEqual(
      'view-submitted-nhs-app-template'
    );
  });

  test('SMS', () => {
    expect(viewSubmittedTemplatePages('SMS')).toEqual(
      'view-submitted-text-message-template'
    );
  });

  test('EMAIL', () => {
    expect(viewSubmittedTemplatePages('EMAIL')).toEqual(
      'view-submitted-email-template'
    );
  });
});
