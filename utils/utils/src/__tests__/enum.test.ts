import {
  Language,
  LetterType,
  TEMPLATE_TYPE_LIST,
  TemplateDto,
  TemplateStatus,
  TemplateType,
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
  templateStatusDeleteAction,
  templateStatusCopyAction,
  templateTypeCopyAction,
  templateTypeDeleteAction,
  templateDisplayCopyAction,
  templateDisplayDeleteAction,
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
    'should give the expected colour when templateStatus is %s',
    (templateStatus) => {
      const expectedColours: { [key in TemplateStatus]?: string } = {
        SUBMITTED: 'grey',
        PENDING_PROOF: 'yellow',
        PENDING_PROOF_REQUEST: 'blue',
        PENDING_UPLOAD: 'blue',
        PENDING_VALIDATION: 'blue',
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

describe('templateStatusCopyAction', () => {
  test.each(TEMPLATE_STATUS_LIST)(
    'should give the expected result for display of copy action when templateStatus is %s',
    (templateStatus) => {
      const statusWithNoExpectedCopyAction: TemplateStatus[] = [
        'DELETED',
        'PENDING_PROOF',
      ];

      expect(templateStatusCopyAction(templateStatus)).toEqual(
        !statusWithNoExpectedCopyAction.includes(templateStatus)
      );
    }
  );
});

describe('templateStatusDeleteAction', () => {
  test.each(TEMPLATE_STATUS_LIST)(
    'should give the expected result for display of delete action when templateStatus is %s',
    (templateStatus) => {
      const statusWithNoExpectedDeleteAction: TemplateStatus[] = [
        'DELETED',
        'SUBMITTED',
        'PENDING_PROOF',
      ];

      expect(templateStatusDeleteAction(templateStatus)).toEqual(
        !statusWithNoExpectedDeleteAction.includes(templateStatus)
      );
    }
  );
});

describe('templateTypeCopyAction', () => {
  test.each(TEMPLATE_TYPE_LIST)(
    'should give the expected result for display of copy action when templateType is %s',
    (templateType) => {
      const typesWithNoExpectedCopyAction: TemplateType[] = ['LETTER'];

      expect(templateTypeCopyAction(templateType)).toEqual(
        !typesWithNoExpectedCopyAction.includes(templateType)
      );
    }
  );
});

describe('templateTypeDeleteAction', () => {
  test.each(TEMPLATE_TYPE_LIST as TemplateType[])(
    'should give the expected result for display of delete action when templateType is %s',
    (templateType) => {
      const typesWithNoExpectedDeleteAction: TemplateType[] = [];

      expect(templateTypeDeleteAction(templateType)).toEqual(
        !typesWithNoExpectedDeleteAction.includes(templateType)
      );
    }
  );
});

describe('templateDisplayCopyAction', () => {
  test.each([
    ['NHS_APP', 'SUBMITTED', true],
    ['NHS_APP', 'NOT_YET_SUBMITTED', true],
    ['NHS_APP', 'DELETED', false],
    ['SMS', 'SUBMITTED', true],
    ['SMS', 'NOT_YET_SUBMITTED', true],
    ['SMS', 'DELETED', false],
    ['EMAIL', 'SUBMITTED', true],
    ['EMAIL', 'NOT_YET_SUBMITTED', true],
    ['EMAIL', 'DELETED', false],
    ['EMAIL', 'PENDING_PROOF', false], // should not occur in practice, just for test purposes
    ['LETTER', 'SUBMITTED', false],
    ['LETTER', 'NOT_YET_SUBMITTED', false],
    ['LETTER', 'DELETED', false],
    ['LETTER', 'PENDING_PROOF', false],
    ['LETTER', 'PENDING_PROOF_REQUEST', false],
    ['LETTER', 'PENDING_UPLOAD', false],
    ['LETTER', 'PENDING_VALIDATION', false],
    ['LETTER', 'VIRUS_SCAN_FAILED', false],
    ['LETTER', 'VALIDATION_FAILED', false],
  ])(
    'should give the expected result for display of copy action when template has type of %s and status of %s',
    (type, status, shouldDisplayCopyAction) => {
      const templateType = type as TemplateType;
      const templateStatus = status as TemplateStatus;

      expect(
        templateDisplayCopyAction({
          templateType,
          templateStatus,
        } as TemplateDto)
      ).toBe(shouldDisplayCopyAction);
    }
  );
});

describe('templateDisplayDeleteAction', () => {
  test.each([
    ['NHS_APP', 'SUBMITTED', false],
    ['NHS_APP', 'NOT_YET_SUBMITTED', true],
    ['NHS_APP', 'DELETED', false],
    ['SMS', 'SUBMITTED', false],
    ['SMS', 'NOT_YET_SUBMITTED', true],
    ['SMS', 'DELETED', false],
    ['EMAIL', 'SUBMITTED', false],
    ['EMAIL', 'NOT_YET_SUBMITTED', true],
    ['EMAIL', 'DELETED', false],
    ['EMAIL', 'PENDING_PROOF', false], // should not occur in practice, just for test purposes
    ['LETTER', 'SUBMITTED', false],
    ['LETTER', 'NOT_YET_SUBMITTED', true],
    ['LETTER', 'DELETED', false],
    ['LETTER', 'PENDING_PROOF', false],
    ['LETTER', 'PENDING_PROOF_REQUEST', true],
    ['LETTER', 'PENDING_UPLOAD', true],
    ['LETTER', 'PENDING_VALIDATION', true],
    ['LETTER', 'VIRUS_SCAN_FAILED', true],
    ['LETTER', 'VALIDATION_FAILED', true],
  ])(
    'should give the expected result for display of delete action when template has type of %s and status of %s',
    (type, status, shouldDisplayDeleteAction) => {
      const templateType = type as TemplateType;
      const templateStatus = status as TemplateStatus;

      expect(
        templateDisplayDeleteAction({
          templateType,
          templateStatus,
        } as TemplateDto)
      ).toBe(shouldDisplayDeleteAction);
    }
  );
});
