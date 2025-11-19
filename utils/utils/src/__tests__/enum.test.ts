/* eslint-disable unicorn/no-array-callback-reference */
import {
  Language,
  LetterType,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-backend-client';
import {
  alphabeticalLanguageList,
  alphabeticalLetterTypeList,
  isRightToLeft,
  languageMapping,
  letterTypeDisplayMappings,
  previewSubmittedTemplatePages,
  previewTemplatePages,
  statusToColourMapping,
  channelToTemplateType,
  templateTypeToChannel,
  channelDisplayMappings,
  messagePlanStatusToDisplayText,
  messagePlanStatusToTagColour,
  messagePlanChooseTemplateUrl,
  ORDINALS,
  statusToDisplayMapping,
  templateCreationPages,
  templateDisplayCopyAction,
  templateDisplayDeleteAction,
  templateTypeDisplayMappings,
  templateTypeToUrlTextMappings,
  cascadeTemplateTypeToUrlTextMappings,
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
    ['x1', 'en', 'Large print letter'],
    ['q4', 'en', 'British Sign Language letter'],
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
      ['q4', 'British Sign Language'],
      ['x1', 'Large print'],
      ['x0', 'Standard'],
    ]);
  });
});

describe('alphabeticalLanguageList', () => {
  test('Alphabetical language list produced', () => {
    expect(alphabeticalLanguageList).toEqual([
      ['sq', { name: 'Albanian', rtl: false }],
      ['ar', { name: 'Arabic', rtl: true }],
      ['bn', { name: 'Bengali', rtl: false }],
      ['bg', { name: 'Bulgarian', rtl: false }],
      ['zh', { name: 'Chinese', rtl: false }],
      ['en', { name: 'English', rtl: false }],
      ['fr', { name: 'French', rtl: false }],
      ['de', { name: 'German', rtl: false }],
      ['el', { name: 'Greek', rtl: false }],
      ['gu', { name: 'Gujurati', rtl: false }],
      ['hi', { name: 'Hindi', rtl: false }],
      ['hu', { name: 'Hungarian', rtl: false }],
      ['it', { name: 'Italian', rtl: false }],
      ['ku', { name: 'Kurdish', rtl: true }],
      ['lv', { name: 'Latvian', rtl: false }],
      ['lt', { name: 'Lithuanian', rtl: false }],
      ['ne', { name: 'Nepali', rtl: false }],
      ['fa', { name: 'Persian', rtl: true }],
      ['pl', { name: 'Polish', rtl: false }],
      ['pt', { name: 'Portuguese', rtl: false }],
      ['pa', { name: 'Punjabi', rtl: false }],
      ['ro', { name: 'Romanian', rtl: false }],
      ['ru', { name: 'Russian', rtl: false }],
      ['sk', { name: 'Slovak', rtl: false }],
      ['so', { name: 'Somali', rtl: false }],
      ['es', { name: 'Spanish', rtl: false }],
      ['ta', { name: 'Tamil', rtl: false }],
      ['tr', { name: 'Turkish', rtl: false }],
      ['ur', { name: 'Urdu', rtl: true }],
    ]);
  });
});

describe('statusToDisplayMapping', () => {
  test.each([
    { type: 'LETTER' as TemplateType, expected: 'Not yet submitted' },
    { type: 'NHS_APP' as TemplateType, expected: 'Draft' },
    { type: 'SMS' as TemplateType, expected: 'Draft' },
    { type: 'EMAIl' as TemplateType, expected: 'Draft' },
  ])(
    'When templateType is %type NOT_YET_SUBMITTED should be %expected',
    ({ type, expected }) => {
      expect(
        statusToDisplayMapping({
          templateType: type,
          templateStatus: 'NOT_YET_SUBMITTED',
        })
      ).toEqual(expected);
    }
  );

  test('SUBMITTED', () => {
    expect(
      statusToDisplayMapping({
        templateType: 'SMS',
        templateStatus: 'SUBMITTED',
      })
    ).toEqual('Submitted');
  });

  test('DELETED', () => {
    expect(
      statusToDisplayMapping({
        templateType: 'SMS',
        templateStatus: 'DELETED',
      })
    ).toEqual('');
  });
});

describe('statusToColourMapping', () => {
  it.each(TEMPLATE_STATUS_LIST)(
    'should give the expected colour when templateStatus is %s for LETTERS',
    (templateStatus) => {
      const expectedColours: { [key in TemplateStatus]?: string } = {
        SUBMITTED: 'grey',
        WAITING_FOR_PROOF: 'yellow',
        PENDING_PROOF_REQUEST: 'blue',
        PENDING_UPLOAD: 'blue',
        PENDING_VALIDATION: 'blue',
        VIRUS_SCAN_FAILED: 'red',
        VALIDATION_FAILED: 'red',
        PROOF_AVAILABLE: 'orange',
      };

      expect(
        statusToColourMapping({ templateStatus, templateType: 'LETTER' })
      ).toEqual(expectedColours[templateStatus]);
    }
  );

  describe.each(['NHS_APP', 'SMS', 'EMAIL'] as TemplateType[])(
    'template type: %p',
    (templateType) => {
      it.each(TEMPLATE_STATUS_LIST)(
        'should give the expected colour when templateStatus is %p',
        (templateStatus) => {
          const expectedColours: { [key in TemplateStatus]?: string } = {
            SUBMITTED: 'grey',
            WAITING_FOR_PROOF: 'yellow',
            PENDING_PROOF_REQUEST: 'blue',
            PENDING_UPLOAD: 'blue',
            PENDING_VALIDATION: 'blue',
            VIRUS_SCAN_FAILED: 'red',
            VALIDATION_FAILED: 'red',
            PROOF_AVAILABLE: 'orange',
            NOT_YET_SUBMITTED: 'green',
          };

          expect(
            statusToColourMapping({ templateStatus, templateType })
          ).toEqual(expectedColours[templateStatus]);
        }
      );
    }
  );
});

describe('templateTypeToUrlTextMappings', () => {
  test.each([
    ['NHS_APP', 'nhs-app'],
    ['SMS', 'text-message'],
    ['EMAIL', 'email'],
    ['LETTER', 'letter'],
  ] as const)('$type maps to url fragment $expected', (type, expected) => {
    expect(templateTypeToUrlTextMappings(type)).toEqual(expected);
  });
});

describe('cascadeTemplateTypeToUrlTextMappings', () => {
  test.each([
    ['NHS_APP', 'nhs-app'],
    ['SMS', 'text-message'],
    ['EMAIL', 'email'],
    ['LETTER', 'standard-english-letter'],
  ] as const)('$type maps to url fragment $expected', (type, expected) => {
    expect(cascadeTemplateTypeToUrlTextMappings(type)).toEqual(expected);
  });
});

describe('templateCreationPages', () => {
  test.each([
    ['NHS_APP' as const, '/create-nhs-app-template'],
    ['SMS' as const, '/create-text-message-template'],
    ['EMAIL' as const, '/create-email-template'],
    ['LETTER' as const, '/upload-letter-template'],
  ])('$templateType', (templateType: TemplateType, slug) => {
    expect(templateCreationPages(templateType)).toEqual(slug);
  });
});

describe('messagePlanChooseTemplateUrl', () => {
  test.each([
    ['NHS_APP', 'choose-nhs-app-template'],
    ['EMAIL', 'choose-email-template'],
    ['SMS', 'choose-text-message-template'],
    ['LETTER', 'choose-standard-english-letter-template'],
  ] as const)('should map %s to "%s"', (type, expected) => {
    expect(messagePlanChooseTemplateUrl(type)).toBe(expected);
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

describe('templateDisplayCopyAction', () => {
  test.each<[TemplateType, TemplateStatus, boolean]>([
    ['NHS_APP', 'SUBMITTED', true],
    ['NHS_APP', 'NOT_YET_SUBMITTED', true],
    ['NHS_APP', 'DELETED', false],
    ['SMS', 'SUBMITTED', true],
    ['SMS', 'NOT_YET_SUBMITTED', true],
    ['SMS', 'DELETED', false],
    ['EMAIL', 'SUBMITTED', true],
    ['EMAIL', 'NOT_YET_SUBMITTED', true],
    ['EMAIL', 'DELETED', false],
    ['EMAIL', 'WAITING_FOR_PROOF', false], // should not occur in practice, just for test purposes
    ['LETTER', 'SUBMITTED', false],
    ['LETTER', 'NOT_YET_SUBMITTED', false], // should not occur in practice, just for test purposes
    ['LETTER', 'DELETED', false],
    ['LETTER', 'WAITING_FOR_PROOF', false],
    ['LETTER', 'PENDING_PROOF_REQUEST', false],
    ['LETTER', 'PENDING_UPLOAD', false],
    ['LETTER', 'PENDING_VALIDATION', false],
    ['LETTER', 'VIRUS_SCAN_FAILED', false],
    ['LETTER', 'VALIDATION_FAILED', false],
    ['LETTER', 'PROOF_AVAILABLE', false],
  ])(
    'should give the expected result for display of copy action when template has type of %s and status of %s',
    (templateType, templateStatus, shouldDisplayCopyAction) => {
      expect(
        templateDisplayCopyAction({
          templateType,
          templateStatus,
        })
      ).toBe(shouldDisplayCopyAction);
    }
  );
});

describe('templateDisplayDeleteAction', () => {
  test.each<[TemplateType, TemplateStatus, boolean]>([
    ['NHS_APP', 'SUBMITTED', false],
    ['NHS_APP', 'NOT_YET_SUBMITTED', true],
    ['NHS_APP', 'DELETED', false],
    ['SMS', 'SUBMITTED', false],
    ['SMS', 'NOT_YET_SUBMITTED', true],
    ['SMS', 'DELETED', false],
    ['EMAIL', 'SUBMITTED', false],
    ['EMAIL', 'NOT_YET_SUBMITTED', true],
    ['EMAIL', 'DELETED', false],
    ['EMAIL', 'WAITING_FOR_PROOF', false], // should not occur in practice, just for test purposes
    ['LETTER', 'SUBMITTED', false],
    ['LETTER', 'NOT_YET_SUBMITTED', true],
    ['LETTER', 'DELETED', false],
    ['LETTER', 'WAITING_FOR_PROOF', false],
    ['LETTER', 'PENDING_PROOF_REQUEST', true],
    ['LETTER', 'PENDING_UPLOAD', true],
    ['LETTER', 'PENDING_VALIDATION', true],
    ['LETTER', 'VIRUS_SCAN_FAILED', true],
    ['LETTER', 'VALIDATION_FAILED', true],
    ['LETTER', 'PROOF_AVAILABLE', true],
  ])(
    'should give the expected result for display of delete action when template has type of %s and status of %s',
    (templateType, templateStatus, shouldDisplayDeleteAction) => {
      expect(
        templateDisplayDeleteAction({
          templateType,
          templateStatus,
        })
      ).toBe(shouldDisplayDeleteAction);
    }
  );
});

describe('Right-to-left language indicator', () => {
  test('should flag expected languages as right-to-left and all others as left-to-right', () => {
    // arrange
    const expectedRtlLanguages = ['Arabic', 'Kurdish', 'Persian', 'Urdu'];
    const allLanguages = alphabeticalLanguageList.map((entry) => entry[0]);

    // act
    const result = allLanguages.filter(isRightToLeft).map(languageMapping);

    // assert
    expect(result).toEqual(expectedRtlLanguages);
  });
});

describe('channelToTemplateType', () => {
  test.each([
    ['NHSAPP', 'NHS_APP'],
    ['SMS', 'SMS'],
    ['EMAIL', 'EMAIL'],
    ['LETTER', 'LETTER'],
  ] as const)('should map %s → %s', (channel, expected) => {
    expect(channelToTemplateType(channel)).toBe(expected);
  });
});

describe('templateTypeToChannel', () => {
  test.each([
    ['NHS_APP', 'NHSAPP'],
    ['SMS', 'SMS'],
    ['EMAIL', 'EMAIL'],
    ['LETTER', 'LETTER'],
  ] as const)('should map %s → %s', (type, expected) => {
    expect(templateTypeToChannel(type)).toBe(expected);
  });
});

describe('channel mappings are reversable', () => {
  test.each(['NHSAPP', 'SMS', 'EMAIL', 'LETTER'] as const)(
    'templateTypeToChannel(channelToTemplateType(%s)) → same channel',
    (channel) => {
      expect(templateTypeToChannel(channelToTemplateType(channel))).toBe(
        channel
      );
    }
  );
});

describe('channelDisplayMappings', () => {
  test.each([
    ['NHSAPP', 'NHS App'],
    ['SMS', 'Text message (SMS)'],
    ['EMAIL', 'Email'],
    ['LETTER', 'Letter'],
  ] as const)('should map %s to "%s"', (channel, expected) => {
    expect(channelDisplayMappings(channel)).toBe(expected);
  });
});

describe('messagePlanStatusToDisplayText', () => {
  test.each([
    ['DRAFT', 'Draft'],
    ['COMPLETED', 'Production'],
    ['DELETED', ''],
  ] as const)('should map %s to "%s"', (status, expected) => {
    expect(messagePlanStatusToDisplayText(status)).toBe(expected);
  });
});

describe('messagePlanStatusToTagColour', () => {
  test.each([
    ['DRAFT', 'green'],
    ['COMPLETED', 'red'],
  ] as const)('should map %s to colour "%s"', (status, colour) => {
    expect(messagePlanStatusToTagColour(status)).toBe(colour);
  });

  test('should map DELETED to undefined colour (not displayed)', () => {
    expect(messagePlanStatusToTagColour('DELETED')).toBeUndefined();
  });
});

describe('ORDINALS', () => {
  test('should contain first six ordinals in order', () => {
    expect(ORDINALS).toEqual([
      'First',
      'Second',
      'Third',
      'Fourth',
      'Fifth',
      'Sixth',
    ]);
  });

  test('should be indexable', () => {
    expect(ORDINALS[0]).toBe('First');
    expect(ORDINALS.at(-1)).toBe('Sixth');
  });
});
