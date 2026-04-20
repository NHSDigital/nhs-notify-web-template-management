/* eslint-disable unicorn/no-array-callback-reference */

import {
  TEMPLATE_STATUS_LIST,
  LANGUAGE_LIST,
  TEMPLATE_TYPE_LIST,
} from 'nhs-notify-backend-client/schemas';
import type {
  Language,
  LetterType,
  TemplateStatus,
  TemplateType,
  LetterVersion,
  TemplateDto,
} from 'nhs-notify-web-template-management-types';
import {
  alphabeticalLanguageList,
  alphabeticalLetterTypeList,
  isRightToLeft,
  languageMapping,
  letterTypeDisplayMappings,
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
  createTemplateUrl,
  isLanguage,
  getMessageOrderOptions,
  MESSAGE_ORDER_OPTIONS_LIST,
  isFrontendSupportedLetterType,
  FRONTEND_SUPPORTED_LETTER_TYPES,
  getPreviewURL,
  FrontendSupportedAccessibleFormats,
  FrontendSupportedLetterType,
  getFrontendLetterTypeForUrl,
} from '../enum';
import { mockDeep } from 'jest-mock-extended';

describe('isFrontendSupportedLetterType', () => {
  it.each(FRONTEND_SUPPORTED_LETTER_TYPES)(
    'returns true when letter type is %s',
    (letterType) => {
      expect(isFrontendSupportedLetterType(letterType)).toBe(true);
    }
  );

  it('returns false when letter type is not valid', () => {
    expect(isFrontendSupportedLetterType('q14')).toBe(false);
  });
});

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
  ] as const)('%s maps to url fragment %s', (type, expected) => {
    expect(legacyTemplateTypeToUrlTextMappings(type)).toEqual(expected);
  });
});

describe('testMessageUrlSegmentMapping', () => {
  test.each([
    ['NHS_APP', 'nhs-app-message'],
    ['SMS', 'text-message'],
    ['EMAIL', 'email'],
  ] as const)('maps %s to url segment %s', (type, expected) => {
    expect(testMessageUrlSegmentMapping(type)).toEqual(expected);
  });
});

describe('sendDigitalTemplateTestMessageUrl', () => {
  test.each([
    ['NHS_APP', 'template-123', '/send-test-nhs-app-message/template-123'],
    ['SMS', 'template-456', '/send-test-text-message/template-456'],
    ['EMAIL', 'template-789', '/send-test-email/template-789'],
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
  ] as [TemplateType, string][])(
    '%s maps to url fragment %s',
    (type, expected) => {
      expect(templateTypeToUrlTextMappings(type)).toEqual(expected);
    }
  );

  test.each([
    ['x0', 'standard-english-letter'],
    ['x1', 'large-print-letter'],
    ['q4', 'british-sign-language-letter'],
    ['language', 'other-language-letter'],
  ] as [FrontendSupportedLetterType, string][])(
    '%s letter maps to url fragment %s',
    (letterType, expected) => {
      expect(templateTypeToUrlTextMappings('LETTER', letterType)).toEqual(
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
  ])('%s', (templateType: TemplateType, slug) => {
    expect(legacyTemplateCreationPages(templateType)).toEqual(slug);
  });
});

describe('createTemplateUrl', () => {
  test.each([
    ['NHS_APP', '/create-nhs-app-template'],
    ['SMS', '/create-text-message-template'],
    ['EMAIL', '/create-email-template'],
    ['LETTER', '/upload-standard-english-letter-template'],
  ] as [TemplateType, string][])(
    '%s template returns %s',
    (templateType, expected) => {
      expect(createTemplateUrl(templateType)).toEqual(expected);
    }
  );

  test.each([
    ['x0', '/upload-standard-english-letter-template'],
    ['language', '/upload-other-language-letter-template'],
    ['x1', '/upload-large-print-letter-template'],
    ['q4', '/upload-british-sign-language-letter-template'],
  ] as [FrontendSupportedLetterType, string][])(
    '%s letter returns %s',
    (letterType, expected) => {
      expect(createTemplateUrl('LETTER', letterType)).toEqual(expected);
    }
  );
});

describe('messagePlanChooseTemplateUrl', () => {
  test.each([
    ['NHS_APP', 'choose-nhs-app-template'],
    ['SMS', 'choose-text-message-template'],
    ['EMAIL', 'choose-email-template'],
    ['LETTER', 'choose-standard-english-letter-template'],
  ] as [TemplateType, string][])(
    '%s template returns %s',
    (templateType, expected) => {
      expect(messagePlanChooseTemplateUrl(templateType)).toBe(expected);
    }
  );

  test.each([
    ['x0', 'choose-standard-english-letter-template'],
    ['language', 'choose-other-language-letter-template'],
    ['x1', 'choose-large-print-letter-template'],
    ['q4', 'choose-british-sign-language-letter-template'],
  ] as [FrontendSupportedLetterType, string][])(
    '%s letter returns %s',
    (letterType, expected) => {
      expect(messagePlanChooseTemplateUrl('LETTER', letterType)).toBe(expected);
    }
  );
});

describe('getPreviewUrl', () => {
  test.each<{
    mockTemplate: Partial<TemplateDto>;
    expectedReturn: string;
  }>([
    {
      mockTemplate: {
        templateType: 'EMAIL',
        templateStatus: 'NOT_YET_SUBMITTED',
        id: 'template-id',
      },
      expectedReturn: '/preview-email-template/template-id',
    },
    {
      mockTemplate: {
        templateType: 'SMS',
        templateStatus: 'NOT_YET_SUBMITTED',
        id: 'template-id',
      },
      expectedReturn: '/preview-text-message-template/template-id',
    },
    {
      mockTemplate: {
        templateType: 'NHS_APP',
        templateStatus: 'NOT_YET_SUBMITTED',
        id: 'template-id',
      },
      expectedReturn: '/preview-nhs-app-template/template-id',
    },
    {
      mockTemplate: {
        templateType: 'LETTER',
        templateStatus: 'NOT_YET_SUBMITTED',
        id: 'template-id',
      },
      expectedReturn: '/preview-letter-template/template-id',
    },
    {
      mockTemplate: {
        templateType: 'EMAIL',
        templateStatus: 'SUBMITTED',
        id: 'template-id',
      },
      expectedReturn: '/preview-submitted-email-template/template-id',
    },
    {
      mockTemplate: {
        templateType: 'SMS',
        templateStatus: 'SUBMITTED',
        id: 'template-id',
      },
      expectedReturn: '/preview-submitted-text-message-template/template-id',
    },
    {
      mockTemplate: {
        templateType: 'NHS_APP',
        templateStatus: 'SUBMITTED',
        id: 'template-id',
      },
      expectedReturn: '/preview-submitted-nhs-app-template/template-id',
    },
    {
      mockTemplate: {
        templateType: 'LETTER',
        templateStatus: 'SUBMITTED',
        id: 'template-id',
      },
      expectedReturn: '/preview-submitted-letter-template/template-id',
    },
    {
      mockTemplate: {
        templateType: 'LETTER',
        templateStatus: 'PROOF_APPROVED',
        id: 'template-id',
        letterVersion: 'AUTHORING',
      },
      expectedReturn: '/preview-approved-letter-template/template-id',
    },
    {
      mockTemplate: {
        templateType: 'LETTER',
        templateStatus: 'SUBMITTED',
        id: 'template-id',
        letterVersion: 'AUTHORING',
      },
      expectedReturn: '/preview-approved-letter-template/template-id',
    },
  ])('returns $expectedReturn', ({ mockTemplate, expectedReturn }) => {
    expect(getPreviewURL(mockDeep<TemplateDto>(mockTemplate))).toEqual(
      expectedReturn
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
  const cases: [FrontendSupportedAccessibleFormats, string][] = [
    ['q4', 'British Sign Language letter'],
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

describe('getMessageOrderOptions', () => {
  const baseFeatures = {
    digitalProofingEmail: false,
    digitalProofingNhsApp: false,
    digitalProofingSms: false,
    letterAuthoring: true,
    proofing: false,
    routing: false,
  };

  test('returns all options when letterAuthoring is enabled', () => {
    expect(getMessageOrderOptions(baseFeatures)).toEqual([
      ...MESSAGE_ORDER_OPTIONS_LIST,
    ]);
  });

  test('filters letter options when letterAuthoring is disabled', () => {
    expect(
      getMessageOrderOptions({
        ...baseFeatures,
        letterAuthoring: false,
      })
    ).toEqual([
      'NHSAPP',
      'NHSAPP,EMAIL',
      'NHSAPP,SMS',
      'NHSAPP,EMAIL,SMS',
      'NHSAPP,SMS,EMAIL',
      'EMAIL',
    ]);
  });
});

describe('getFrontendLetterTypeForUrl', () => {
  test.each(['NHS_APP', 'EMAIL', 'SMS'] as TemplateType[])(
    'digital template type %s returns undefined',
    (templateType) => {
      expect(getFrontendLetterTypeForUrl({ templateType })).toBeUndefined();
    }
  );

  test.each([
    ['x0', 'en', 'x0'],
    ['x0', 'fr', 'language'],
    ['x1', 'en', 'x1'],
    ['x1', 'fr', 'x1'],
    ['q4', 'en', 'q4'],
    ['q4', 'fr', 'q4'],
  ] as [LetterType, Language, string][])(
    'letter template type=%s language=%s returns %s',
    (letterType, language, expected) => {
      expect(
        getFrontendLetterTypeForUrl({
          templateType: 'LETTER',
          letterType,
          language,
        })
      ).toEqual(expected);
    }
  );
});
