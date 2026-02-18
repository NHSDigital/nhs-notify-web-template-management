/* eslint-disable sonarjs/publicly-writable-directories */
import carbone from 'carbone';
import type { RenderCallback, RenderOptions } from 'carbone';
import { Carbone } from '../../infra/carbone';
import { extractMarkers } from '../../infra/carbone-internal';

jest.mock('carbone');
jest.mock('../../infra/carbone-internal');

type RenderWithOptions = (
  templatePath: string,
  data: object,
  options: RenderOptions,
  callback: RenderCallback
) => void;

const mockCarboneRender =
  carbone.render as unknown as jest.MockedFunction<RenderWithOptions>;
const mockExtractMarkers = jest.mocked(extractMarkers);

function setup() {
  return new Carbone();
}

describe('Carbone', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('render', () => {
    test('resolves with buffer on success', async () => {
      const instance = setup();
      const expectedBuffer = Buffer.from('pdf-content');

      mockCarboneRender.mockImplementation((_path, _data, _opts, cb) => {
        cb(null, expectedBuffer, 'report');
      });

      const result = await instance.render('/tmp/template.docx', {
        name: 'value',
      });

      expect(result).toBe(expectedBuffer);
      expect(mockCarboneRender).toHaveBeenCalledWith(
        '/tmp/template.docx',
        { name: 'value' },
        { convertTo: 'pdf' },
        expect.any(Function)
      );
    });

    test('rejects when carbone returns an error', async () => {
      const instance = setup();

      mockCarboneRender.mockImplementation((_path, _data, _opts, cb) => {
        cb(new Error('Render failed'), Buffer.alloc(0), 'report');
      });

      await expect(instance.render('/tmp/template.docx', {})).rejects.toThrow(
        'Render failed'
      );
    });

    test('rejects when result is not a Buffer', async () => {
      const instance = setup();

      mockCarboneRender.mockImplementation((_path, _data, _opts, cb) => {
        cb(null, 'not-a-buffer' as unknown as Buffer, 'report');
      });

      await expect(instance.render('/tmp/template.docx', {})).rejects.toThrow(
        'Rendered buffer is not a Buffer'
      );
    });
  });

  describe('extractMarkers', () => {
    test('strips _root. prefix and returns marker names as a Set', async () => {
      const instance = setup();

      mockExtractMarkers.mockResolvedValue([
        { name: '_root.d.address_line_1', pos: 0 },
        { name: '_root.d.first_name', pos: 1 },
        { name: '_root.d.last_name', pos: 2 },
      ]);

      const result = await instance.extractMarkers('/tmp/template.docx');

      expect(result).toEqual(
        new Set(['d.address_line_1', 'd.first_name', 'd.last_name'])
      );
      expect(mockExtractMarkers).toHaveBeenCalledWith('/tmp/template.docx');
    });

    test('skips markers without _root. prefix', async () => {
      const instance = setup();

      mockExtractMarkers.mockResolvedValue([
        { name: '_root.d.address_line_1', pos: 0 },
        { name: 'no_root_prefix', pos: 1 },
        { name: '_root.d.first_name', pos: 2 },
      ]);

      const result = await instance.extractMarkers('/tmp/template.docx');

      expect(result).toEqual(new Set(['d.address_line_1', 'd.first_name']));
    });

    test('returns empty set when no markers are found', async () => {
      const instance = setup();

      mockExtractMarkers.mockResolvedValue([]);

      const result = await instance.extractMarkers('/tmp/template.docx');

      expect(result).toEqual(new Set());
    });

    test('returns empty set when all markers lack _root. prefix', async () => {
      const instance = setup();

      mockExtractMarkers.mockResolvedValue([
        { name: 'bad_marker', pos: 0 },
        { name: 'another_bad', pos: 1 },
      ]);

      const result = await instance.extractMarkers('/tmp/template.docx');

      expect(result).toEqual(new Set());
    });
  });
});
