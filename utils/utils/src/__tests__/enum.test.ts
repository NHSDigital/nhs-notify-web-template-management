import {
  Language,
  LetterType,
  TemplateStatus,
} from 'nhs-notify-backend-client';
import {
  alphabeticalLanguageList,
  alphabeticalLetterTypeList,
  letterTypeDisplayMappings,
  previewTemplatePages,
  templateStatusToColourMappings,
  templateStatusToDisplayMappings,
  templateTypeDisplayMappings,
  templateTypeToUrlTextMappings,
  previewSubmittedTemplatePages,
} from '../enum';
import { TEMPLATE_STATUS_LIST } from 'nhs-notify-backend-client';

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
    ['x0', 'bn', 'Standard letter - Bengali'],
    ['x0', 'el', 'Standard letter - Greek'],
    ['q1', 'en', 'Braille letter'],
    ['x3', 'en', 'Audio CD letter'],
    ['x1', 'en', 'Large print letter'],
    ['q4', 'en', 'British Sign Language letter'],
    ['q1', 'fr', 'Braille letter - French'],
    ['x3', 'it', 'Audio CD letter - Italian'],
    ['x1', 'de', 'Large print letter - German'],
    ['q4', 'es', 'British Sign Language letter - Spanish'],
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

describe('templateStatusToColourMappings', () => {
  it.each(TEMPLATE_STATUS_LIST)(
    'should give the expected colour when templateType is %s',
    (templateStatus) => {
      const expectedColours: { [key in TemplateStatus]?: string } = {
        SUBMITTED: 'grey',
        PENDING_PROOF_REQUEST: 'blue',
        VIRUS_SCAN_FAILED: 'red',
        VALIDATION_FAILED: 'red',
      };

      expect(templateStatusToColourMappings(templateStatus)).toEqual(
        expectedColours[templateStatus]
      );
    }
  );
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

describe('previewSubmittedTemplatePages', () => {
  test('NHS_APP', () => {
    expect(previewSubmittedTemplatePages('NHS_APP')).toEqual(
      'preview-submitted-nhs-app-template'
    );
  });

  test('SMS', () => {
    expect(previewSubmittedTemplatePages('SMS')).toEqual(
      'preview-submitted-text-message-template'
    );
  });

  test('EMAIL', () => {
    expect(previewSubmittedTemplatePages('EMAIL')).toEqual(
      'preview-submitted-email-template'
    );
  });
});
