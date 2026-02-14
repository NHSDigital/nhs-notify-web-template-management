import path from 'node:path';
import parser from 'carbone/lib/parser';
import { extractMarkers } from '../infra/carbone-internal';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const DOCX_FIXTURE = path.join(FIXTURES_DIR, 'standard-english-template.docx');
const NON_TEMPLATE_FIXTURE = path.join(FIXTURES_DIR, 'not-a-template.txt');

const EXPECTED_MARKERS = [
  '_root.d.address_line_1',
  '_root.d.address_line_2',
  '_root.d.address_line_3',
  '_root.d.address_line_4',
  '_root.d.address_line_5',
  '_root.d.address_line_6',
  '_root.d.address_line_7',
  '_root.d.date',
  '_root.d.firstName',
  '_root.d.fullName',
  '_root.d.gpSurgeryAddress',
  '_root.d.gpSurgeryName',
  '_root.d.gpSurgeryPhone',
  '_root.d.nhsNumber',
];

describe('extractMarkers', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should extract all markers from the template', async () => {
    const markers = await extractMarkers(DOCX_FIXTURE);

    expect(markers).toEqual(EXPECTED_MARKERS);
  });

  it('should reject for non-existent file', async () => {
    await expect(extractMarkers('/non/existent/path.docx')).rejects.toThrow();
  });

  it('should return empty array for non-template file', async () => {
    const fields = await extractMarkers(NON_TEMPLATE_FIXTURE);
    expect(fields).toEqual([]);
  });

  it('should reject when parser.findMarkers returns an error', async () => {
    jest.spyOn(parser, 'findMarkers').mockImplementation((_xml, cb) => {
      cb(new Error('Parser error'), '', []);
    });

    await expect(extractMarkers(DOCX_FIXTURE)).rejects.toThrow('Parser error');
  });

  it('should deduplicate and sort markers', async () => {
    jest.spyOn(parser, 'findMarkers').mockImplementation((_xml, cb) => {
      cb(null, '', [
        { name: '_root.d.zebra' },
        { name: '_root.d.apple' },
        { name: '_root.d.apple' },
      ]);
    });

    const markers = await extractMarkers(DOCX_FIXTURE);
    expect(markers).toEqual(['_root.d.apple', '_root.d.zebra']);
  });
});
