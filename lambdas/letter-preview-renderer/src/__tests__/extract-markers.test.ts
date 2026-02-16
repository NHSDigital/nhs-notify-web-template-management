import path from 'node:path';
import parser from 'carbone/lib/parser';
import { extractMarkers } from '../infra/carbone-internal';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const DOCX_FIXTURE = path.join(FIXTURES_DIR, 'standard-english-template.docx');
const NON_TEMPLATE_FIXTURE = path.join(FIXTURES_DIR, 'not-a-template.txt');

// Expected unique marker names from the standard template
const EXPECTED_MARKER_NAMES = new Set([
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
]);

describe('extractMarkers', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should extract all markers from the template as Marker objects', async () => {
    const markers = await extractMarkers(DOCX_FIXTURE);

    // Should return Marker objects with name and pos properties
    for (const marker of markers) {
      expect(marker).toHaveProperty('name');
      expect(marker).toHaveProperty('pos');
      expect(typeof marker.name).toBe('string');
      expect(typeof marker.pos).toBe('number');
    }

    // All expected marker names should be present
    const extractedNames = new Set(markers.map((m) => m.name));
    expect(extractedNames).toEqual(EXPECTED_MARKER_NAMES);
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

  it('should preserve duplicate markers without deduplication', async () => {
    jest.spyOn(parser, 'findMarkers').mockImplementation((_xml, cb) => {
      cb(null, '', [
        { name: '_root.d.zebra', pos: 0 },
        { name: '_root.d.apple', pos: 1 },
        { name: '_root.d.apple', pos: 2 },
      ]);
    });

    const markers = await extractMarkers(DOCX_FIXTURE);

    // Should return all markers including duplicates
    expect(markers).toHaveLength(3 * 30); // 3 markers × 30 files in the mock (called for each marked file)
    // At minimum, check that duplicates are preserved when there's one marked file
    const appleMarkers = markers.filter((m) => m.name === '_root.d.apple');
    expect(appleMarkers.length).toBeGreaterThanOrEqual(2);
  });
});
