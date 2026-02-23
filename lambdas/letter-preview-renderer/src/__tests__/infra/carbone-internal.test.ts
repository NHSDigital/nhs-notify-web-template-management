import parser from 'carbone/lib/parser';
import { extractMarkers } from '../../infra/carbone-internal';
import { SOURCE_DOCS } from '../fixtures';

describe('extractMarkers', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([
    {
      ...SOURCE_DOCS['marker-types.docx'],
      markers: [
        '_root.d.correct',
        '_root.c.compliment_banned',
        '_root.d.correct_whitespace_in_braces',
        '_root.d.correct_newline_in_braces',
        '_root.d.correct_mixed_styling',
        '_root.d.correct_bullets1',
        '_root.d.correct_bullets2',
        '_root.$var_banned',
        '_root.#alias_banned',
        '_root.t(translation_banned)',
        '_root.d.rtl_correct',
        '_root.d.correct_in_header',
        '_root.d.correct_in_footer',
      ],
    },
    { ...SOURCE_DOCS['not-a-template.txt'], markers: [] },
    {
      ...SOURCE_DOCS['rtl.docx'],
      markers: [
        '_root.d.fullName',
        '_root.d.example',
        '_root.d.firstName',
        '_root.d.fullName',
        '_root.d.example',
        '_root.d.date',
        '_root.d.nhsNumber',
      ],
    },
    {
      ...SOURCE_DOCS['standard-english.docx'],
      markers: [
        '_root.d.fullName',
        '_root.d.firstName',
        '_root.d.nhsNumber',
        '_root.d.gpSurgeryName',
        '_root.d.gpSurgeryAddress',
        '_root.d.gpSurgeryPhone',
        '_root.d.address_line_1',
        '_root.d.address_line_2',
        '_root.d.address_line_3',
        '_root.d.address_line_4',
        '_root.d.address_line_5',
        '_root.d.address_line_6',
        '_root.d.address_line_7',
        '_root.d.date',
        '_root.d.nhsNumber',
      ],
    },
  ])('markers in $name are as expected', async ({ path, markers }) => {
    expect(await extractMarkers(path)).toEqual(markers);
  });

  it('should reject for non-existent file', async () => {
    await expect(extractMarkers('not-here.docx')).rejects.toThrow();
  });

  it('should reject when parser.findMarkers returns an error', async () => {
    jest.spyOn(parser, 'findMarkers').mockImplementation((_xml, cb) => {
      cb(new Error('Parser error'), '', []);
    });

    await expect(extractMarkers(SOURCE_DOCS['rtl.docx'].path)).rejects.toThrow(
      'Parser error'
    );
  });
});
