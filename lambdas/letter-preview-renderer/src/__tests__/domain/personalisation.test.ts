import { analyseMarkers } from '../../domain/personalisation';

const ALL_ADDRESS_MARKERS = [
  'd.address_line_1',
  'd.address_line_2',
  'd.address_line_3',
  'd.address_line_4',
  'd.address_line_5',
  'd.address_line_6',
  'd.address_line_7',
];

describe('analyseMarkers', () => {
  describe('valid markers', () => {
    it('classifies valid d. markers as system or custom personalisation', () => {
      const markers = new Set([
        ...ALL_ADDRESS_MARKERS,
        'd.fullName',
        'd.myCustomField',
      ]);

      const result = analyseMarkers(markers);

      expect(result.personalisation.system).toEqual(
        expect.arrayContaining([
          'address_line_1',
          'address_line_2',
          'address_line_3',
          'address_line_4',
          'address_line_5',
          'address_line_6',
          'address_line_7',
          'fullName',
        ])
      );
      expect(result.personalisation.custom).toEqual(['myCustomField']);
    });

    it('returns canRender true when all markers are valid', () => {
      const markers = new Set([...ALL_ADDRESS_MARKERS, 'd.fullName']);

      const result = analyseMarkers(markers);

      expect(result.canRender).toBe(true);
    });

    it('returns no validation errors when all address lines present and markers valid', () => {
      const result = analyseMarkers(new Set(ALL_ADDRESS_MARKERS));

      expect(result.validationErrors).toEqual([]);
    });

    it('generates passthrough personalisation for valid markers', () => {
      const markers = new Set([...ALL_ADDRESS_MARKERS, 'd.customField']);

      const result = analyseMarkers(markers);

      console.log(result.passthroughPersonalisation);

      expect(result.passthroughPersonalisation).toEqual({
        address_line_1: '{d.address_line_1}',
        address_line_2: '{d.address_line_2}',
        address_line_3: '{d.address_line_3}',
        address_line_4: '{d.address_line_4}',
        address_line_5: '{d.address_line_5}',
        address_line_6: '{d.address_line_6}',
        address_line_7: '{d.address_line_7}',
        customField: '{d.customField}',
      });
    });
  });

  describe('non-renderable markers', () => {
    it.each([
      ['c. prefix', 'c.compliment'],
      ['o. prefix', 'o.option'],
      ['$ prefix', '$variable'],
      ['# prefix', '#section'],
      ['t() function', 't(translate)'],
    ])('sets canRender to false for %s markers', (_, marker) => {
      const markers = new Set([...ALL_ADDRESS_MARKERS, marker]);

      const result = analyseMarkers(markers);

      expect(result.canRender).toBe(false);
    });

    it('includes non-renderable markers in INVALID_MARKERS validation error issues', () => {
      const markers = new Set([...ALL_ADDRESS_MARKERS, 'c.compliment']);

      const result = analyseMarkers(markers);

      expect(result.validationErrors).toEqual(
        expect.arrayContaining([
          { name: 'INVALID_MARKERS', issues: ['c.compliment'] },
        ])
      );
    });
  });

  describe('invalid-renderable markers', () => {
    it('reports markers without d. prefix as invalid renderable', () => {
      const markers = new Set([...ALL_ADDRESS_MARKERS, 'no.d']);

      const result = analyseMarkers(markers);

      expect(result.canRender).toBe(true);
      expect(result.validationErrors).toEqual(
        expect.arrayContaining([{ name: 'INVALID_MARKERS', issues: ['no.d'] }])
      );
    });

    it('reports d. markers with invalid characters as invalid renderable', () => {
      const markers = new Set([...ALL_ADDRESS_MARKERS, 'd.exclaimation!point']);

      const result = analyseMarkers(markers);

      expect(result.canRender).toBe(true);
      expect(result.validationErrors).toEqual(
        expect.arrayContaining([
          { name: 'INVALID_MARKERS', issues: ['exclaimation!point'] },
        ])
      );
    });

    it('includes invalid-renderable markers in passthrough personalisation', () => {
      const markers = new Set([...ALL_ADDRESS_MARKERS, 'no_prefix']);

      const result = analyseMarkers(markers);

      expect(result.passthroughPersonalisation).toEqual(
        expect.objectContaining({
          no_prefix: '{d.no_prefix}',
        })
      );
    });
  });

  describe('mixed invalid markers', () => {
    it('combines non-renderable and invalid-renderable markers in a single INVALID_MARKERS error', () => {
      const markers = new Set([
        ...ALL_ADDRESS_MARKERS,
        'c.compliment',
        'no_prefix',
      ]);

      const result = analyseMarkers(markers);

      expect(result.canRender).toBe(false);
      expect(result.validationErrors).toEqual(
        expect.arrayContaining([
          {
            name: 'INVALID_MARKERS',
            issues: expect.arrayContaining(['c.compliment', 'no_prefix']),
          },
        ])
      );
    });
  });

  describe('missing address lines', () => {
    it('reports MISSING_ADDRESS_LINES when no address markers present', () => {
      const markers = new Set(['d.fullName']);

      const result = analyseMarkers(markers);

      expect(result.validationErrors).toEqual(
        expect.arrayContaining([{ name: 'MISSING_ADDRESS_LINES' }])
      );
    });

    it('reports MISSING_ADDRESS_LINES when only some address lines present', () => {
      const markers = new Set([
        'd.address_line_1',
        'd.address_line_2',
        'd.fullName',
      ]);

      const result = analyseMarkers(markers);

      expect(result.validationErrors).toEqual(
        expect.arrayContaining([{ name: 'MISSING_ADDRESS_LINES' }])
      );
    });

    it('does not report MISSING_ADDRESS_LINES when all seven address lines present', () => {
      const markers = new Set(ALL_ADDRESS_MARKERS);

      const result = analyseMarkers(markers);

      expect(result.validationErrors).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'MISSING_ADDRESS_LINES' }),
        ])
      );
    });
  });

  describe('unexpected address lines', () => {
    it('reports UNEXPECTED_ADDRESS_LINES when address_line_8 is present', () => {
      const markers = new Set([...ALL_ADDRESS_MARKERS, 'd.address_line_8']);

      const result = analyseMarkers(markers);

      expect(result.validationErrors).toEqual(
        expect.arrayContaining([
          { name: 'UNEXPECTED_ADDRESS_LINES', issues: ['address_line_8'] },
        ])
      );
    });

    it('reports UNEXPECTED_ADDRESS_LINES with multiple extra address lines', () => {
      const markers = new Set([
        ...ALL_ADDRESS_MARKERS,
        'd.address_line_8',
        'd.address_line_9',
      ]);

      const result = analyseMarkers(markers);

      expect(result.validationErrors).toEqual(
        expect.arrayContaining([
          {
            name: 'UNEXPECTED_ADDRESS_LINES',
            issues: expect.arrayContaining([
              'address_line_8',
              'address_line_9',
            ]),
          },
        ])
      );
    });

    it('reports UNEXPECTED_ADDRESS_LINES for address_line_0', () => {
      const markers = new Set([...ALL_ADDRESS_MARKERS, 'd.address_line_0']);

      const result = analyseMarkers(markers);

      expect(result.validationErrors).toEqual(
        expect.arrayContaining([
          { name: 'UNEXPECTED_ADDRESS_LINES', issues: ['address_line_0'] },
        ])
      );
    });

    it('can report both MISSING_ADDRESS_LINES and UNEXPECTED_ADDRESS_LINES simultaneously', () => {
      const markers = new Set([
        'd.address_line_1',
        'd.address_line_2',
        'd.address_line_8',
      ]);

      const result = analyseMarkers(markers);

      expect(result.validationErrors).toEqual(
        expect.arrayContaining([
          { name: 'MISSING_ADDRESS_LINES' },
          { name: 'UNEXPECTED_ADDRESS_LINES', issues: ['address_line_8'] },
        ])
      );
    });
  });

  describe('empty markers', () => {
    it('handles empty marker set', () => {
      const markers = new Set<string>();

      const result = analyseMarkers(markers);

      expect(result.personalisation).toEqual({ system: [], custom: [] });
      expect(result.passthroughPersonalisation).toEqual({});
      expect(result.canRender).toBe(true);
      expect(result.validationErrors).toEqual([
        { name: 'MISSING_ADDRESS_LINES' },
      ]);
    });
  });
});
