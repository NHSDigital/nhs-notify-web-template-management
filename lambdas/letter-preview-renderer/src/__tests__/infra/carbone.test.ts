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
    test('returns marker names as a Set', async () => {
      const instance = setup();

      mockExtractMarkers.mockResolvedValue([
        '_root.d.address_line_1',
        '_root.d.first_name',
        '_root.d.last_name',
      ]);

      const result = await instance.extractMarkers('/tmp/template.docx');

      expect(result).toEqual(
        new Set(['d.address_line_1', 'd.first_name', 'd.last_name'])
      );

      expect(mockExtractMarkers).toHaveBeenCalledWith('/tmp/template.docx');
    });

    test('throws when a marker lacks _root. prefix', async () => {
      const instance = setup();

      mockExtractMarkers.mockResolvedValue([
        '_root.d.address_line_1',
        'no_root_prefix',
        '_root.d.first_name',
      ]);

      await expect(
        instance.extractMarkers('/tmp/template.docx')
      ).rejects.toThrow('Unexpected marker name no_root_prefix');
    });

    test('returns empty set when no markers are found', async () => {
      const instance = setup();

      mockExtractMarkers.mockResolvedValue([]);

      const result = await instance.extractMarkers('/tmp/template.docx');

      expect(result).toEqual(new Set());
    });

    test('deduplicates marker names', async () => {
      const instance = setup();

      mockExtractMarkers.mockResolvedValue([
        '_root.d.first_name',
        '_root.d.first_name',
        '_root.d.last_name',
      ]);

      const result = await instance.extractMarkers('/tmp/template.docx');

      expect(result).toEqual(new Set(['d.first_name', 'd.last_name']));
    });
  });
});
