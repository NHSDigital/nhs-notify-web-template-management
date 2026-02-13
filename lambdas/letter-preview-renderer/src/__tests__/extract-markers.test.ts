import path from 'node:path';
import parser from 'carbone/lib/parser';
import { extractDataFields } from '../utils/extract-markers';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const DOCX_FIXTURE = path.join(FIXTURES_DIR, 'standard-english-template.docx');
const NON_TEMPLATE_FIXTURE = path.join(FIXTURES_DIR, 'not-a-template.txt');

const EXPECTED_DATA_FIELDS = [
  'address_line_1',
  'address_line_2',
  'address_line_3',
  'address_line_4',
  'address_line_5',
  'address_line_6',
  'address_line_7',
  'date',
  'firstName',
  'fullName',
  'gpSurgeryAddress',
  'gpSurgeryName',
  'gpSurgeryPhone',
  'nhsNumber',
];

describe('extractDataFields', () => {
  it('should extract all data fields from the template', async () => {
    const fields = await extractDataFields(DOCX_FIXTURE);
    expect(fields).toEqual(EXPECTED_DATA_FIELDS);
  });

  it('should reject for non-existent file', async () => {
    await expect(
      extractDataFields('/non/existent/path.docx')
    ).rejects.toThrow();
  });

  it('should return empty array for non-template file', async () => {
    const fields = await extractDataFields(NON_TEMPLATE_FIXTURE);
    expect(fields).toEqual([]);
  });

  it('should reject when parser.findMarkers returns an error', async () => {
    jest.spyOn(parser, 'findMarkers').mockImplementation((_xml, cb) => {
      cb(new Error('Parser error'), '', []);
    });

    await expect(extractDataFields(DOCX_FIXTURE)).rejects.toThrow(
      'Parser error'
    );
  });

  it('should ignore non-data markers', async () => {
    jest.spyOn(parser, 'findMarkers').mockImplementation((_xml, cb) => {
      cb(null, '', [
        { name: '_root.d.validField' },
        { name: '_root.c.complementField' },
        { name: '_root.$variable' },
        { name: 'invalidMarker' },
      ]);
    });

    const fields = await extractDataFields(DOCX_FIXTURE);
    expect(fields).toEqual(['validField']);
  });
});
