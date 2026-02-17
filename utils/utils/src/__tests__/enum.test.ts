/* eslint-disable unicorn/no-array-callback-reference */
import {
  Language,
  LetterType,
  TEMPLATE_STATUS_LIST,
  TemplateStatus,
  TemplateType,
  LANGUAGE_LIST,
  LetterVersion,
  TEMPLATE_TYPE_LIST,
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
  legacyTemplateCreationPages,
  templateDisplayCopyAction,
  templateDisplayDeleteAction,
  templateTypeDisplayMappings,
  legacyTemplateTypeToUrlTextMappings,
  testMessageUrlSegmentMapping,
  sendDigitalTemplateTestMessageUrl,
  templateTypeToUrlTextMappings,
  accessibleFormatDisplayMappings,
  type SupportedLetterType,
  createTemplateUrl,
  isLanguage,
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

type StatusCase = [
  status: TemplateStatus,
  type: TemplateType,
  routing: boolean,
  letterVersion: LetterVersion | undefined,
];

const letterVersions = ['PDF', 'AUTHORING'] as const;
const routingOptions = [true, false] as const;
const digitalChannels = TEMPLATE_TYPE_LIST.filter((t) => t !== 'LETTER');

const LETTER_STATUS_CASES: StatusCase[] = TEMPLATE_STATUS_LIST.flatMap(
  (status) =>
    letterVersions.flatMap((version) =>
      routingOptions.map(
        (routingFlag): StatusCase => [
          status,
          'LETTER' as const,
          routingFlag,
          version,
        ]
      )
    )
);

const TEMPLATE_STATUS_CASES: StatusCase[] = [
  ...TEMPLATE_STATUS_LIST.flatMap((status) =>
    digitalChannels.flatMap((type) =>
      routingOptions.map(
        (routingFlag): StatusCase => [status, type, routingFlag, undefined]
      )
    )
  ),
  ...LETTER_STATUS_CASES,
];

describe('statusToDisplayMapping', () => {
  test.each(TEMPLATE_STATUS_CASES)(
    'status=%s type=%s routing=%s letterVersion=%s',
    (status, type, routing, letterVersion) => {
      expect(
        statusToDisplayMapping(
          {
            templateType: type,
            templateStatus: status,
            letterVersion,
          },
          { routing }
        )
      ).toMatchSnapshot();
    }
  );
});

describe('statusToColourMapping', () => {
  test.each(TEMPLATE_STATUS_CASES)(
    'status=%s type=%s routing=%s letterVersion=%s',
    (status, type, routing, letterVersion) => {
      expect(
        statusToColourMapping(
          {
            templateType: type,
            templateStatus: status,
            letterVersion,
          },
          { routing }
        )
      ).toMatchSnapshot();
    }
  );
});

describe('legacyTemplateTypeToUrlTextMappings', () => {
  test.each([
    ['NHS_APP', 'nhs-app'],
    ['SMS', 'text-message'],
    ['EMAIL', 'email'],
    ['LETTER', 'letter'],
  ] as const)('$type maps to url fragment $expected', (type, expected) => {
    expect(legacyTemplateTypeToUrlTextMappings(type)).toEqual(expected);
  });
});

describe('testMessageUrlSegmentMapping', () => {
  test.each([
    ['NHS_APP', 'nhs-app'],
    ['SMS', 'text'],
    ['EMAIL', 'email'],
  ] as const)('maps %s to url segment %s', (type, expected) => {
    expect(testMessageUrlSegmentMapping(type)).toEqual(expected);
  });
});

describe('sendDigitalTemplateTestMessageUrl', () => {
  test.each([
    ['NHS_APP', 'template-123', '/send-test-nhs-app-message/template-123'],
    ['SMS', 'template-456', '/send-test-text-message/template-456'],
    ['EMAIL', 'template-789', '/send-test-email-message/template-789'],
  ] as const)(
    'generates url for %s template with id %s',
    (type, templateId, expected) => {
      expect(sendDigitalTemplateTestMessageUrl(type, templateId)).toEqual(
        expected
      );
    }
  );
});

describe('templateTypeToUrlTextMappings', () => {
  test.each([
    ['NHS_APP', 'nhs-app'],
    ['SMS', 'text-message'],
    ['EMAIL', 'email'],
    ['LETTER', 'standard-english-letter'],
  ] as const)('$type maps to url fragment $expected', (type, expected) => {
    expect(templateTypeToUrlTextMappings(type)).toEqual(expected);
  });

  test.each([
    ['LETTER', 'x0', 'standard-english-letter'],
    ['LETTER', 'x1', 'large-print-letter'],
    ['LETTER', 'q4', 'british-sign-language-letter'],
    ['LETTER', 'language', 'other-language-letter'],
  ] as const)(
    '$letterType $templateType maps to url fragment $expected',
    (templateType, letterType, expected) => {
      expect(templateTypeToUrlTextMappings(templateType, letterType)).toEqual(
        expected
      );
    }
  );
});

describe('legacyTemplateCreationPages', () => {
  test.each([
    ['NHS_APP' as const, '/create-nhs-app-template'],
    ['SMS' as const, '/create-text-message-template'],
    ['EMAIL' as const, '/create-email-template'],
    ['LETTER' as const, '/upload-letter-template'],
  ])('$templateType', (templateType: TemplateType, slug) => {
    expect(legacyTemplateCreationPages(templateType)).toEqual(slug);
  });
});

describe('createTemplateUrl', () => {
  test.each([
    ['NHS_APP' as const, undefined, '/create-nhs-app-template'],
    ['SMS' as const, undefined, '/create-text-message-template'],
    ['EMAIL' as const, undefined, '/create-email-template'],
    ['LETTER' as const, undefined, '/upload-standard-english-letter-template'],
    [
      'LETTER' as const,
      'x0' as const,
      '/upload-standard-english-letter-template',
    ],
    ['LETTER' as const, 'x1' as const, '/upload-large-print-letter-template'],
    [
      'LETTER' as const,
      'q4' as const,
      '/upload-british-sign-language-letter-template',
    ],
    [
      'LETTER' as const,
      'language' as const,
      '/upload-other-language-letter-template',
    ],
  ])(
    '$letterType $templateType returns $slug',
    (
      templateType: TemplateType,
      letterType: SupportedLetterType | undefined,
      slug: string
    ) => {
      expect(createTemplateUrl(templateType, letterType)).toEqual(slug);
    }
  );
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

  describe('letter templates', () => {
    test.each([
      ['x0', 'choose-standard-english-letter-template'],
      ['x1', 'choose-large-print-letter-template'],
      ['language', 'choose-other-language-letter-template'],
    ] as const)(
      'should map LETTER with conditionalType %s to "%s"',
      (conditionalType, expected) => {
        expect(messagePlanChooseTemplateUrl('LETTER', conditionalType)).toBe(
          expected
        );
      }
    );
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
    // letters are never copyable
    ['LETTER', 'SUBMITTED', false],
    ['LETTER', 'NOT_YET_SUBMITTED', false],
    ['LETTER', 'DELETED', false],
    ['LETTER', 'WAITING_FOR_PROOF', false],
    ['LETTER', 'PENDING_PROOF_REQUEST', false],
    ['LETTER', 'PENDING_UPLOAD', false],
    ['LETTER', 'PENDING_VALIDATION', false],
    ['LETTER', 'VIRUS_SCAN_FAILED', false],
    ['LETTER', 'VALIDATION_FAILED', false],
    ['LETTER', 'PROOF_AVAILABLE', false],
    ['LETTER', 'PROOF_APPROVED', false],
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
    ['LETTER', 'PROOF_APPROVED', true],
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
    ['LETTER', 'Standard English letter'],
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

describe('accessibleFormatDisplayMappings', () => {
  const cases: [LetterType, string][] = [
    ['q4', 'British Sign Language letter'],
    ['x0', 'Standard letter'],
    ['x1', 'Large print letter'],
  ];

  test.each(cases)('should map "%s" to "%s"', (format, display) => {
    expect(accessibleFormatDisplayMappings(format)).toEqual(display);
  });
});

describe('isLanguage', () => {
  it.each(LANGUAGE_LIST)('returns true when language is %s', (language) => {
    expect(isLanguage(language)).toBe(true);
  });

  it('returns false when language is not valid', () => {
    expect(isLanguage('not a language')).toBe(false);
  });
});
