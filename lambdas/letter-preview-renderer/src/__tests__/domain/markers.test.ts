import { classifyAndCleanMarkers } from '../../domain/markers';

describe('classifyAndCleanMarkers', () => {
  describe('valid markers', () => {
    it('classifies d.simple_marker as valid', () => {
      const result = classifyAndCleanMarkers(new Set(['d.simple_marker']));

      expect(result.valid).toEqual(new Set(['simple_marker']));
      expect(result['invalid-renderable']).toEqual(new Set());
      expect(result['invalid-non-renderable']).toEqual(new Set());
    });

    it('classifies d.marker-with-dashes as valid', () => {
      const result = classifyAndCleanMarkers(new Set(['d.marker-with-dashes']));

      expect(result.valid).toEqual(new Set(['marker-with-dashes']));
    });

    it('classifies d.marker123 as valid', () => {
      const result = classifyAndCleanMarkers(new Set(['d.marker123']));

      expect(result.valid).toEqual(new Set(['marker123']));
    });

    it('classifies address line markers as valid', () => {
      const markers = new Set([
        'd.address_line_1',
        'd.address_line_2',
        'd.address_line_3',
        'd.address_line_4',
        'd.address_line_5',
        'd.address_line_6',
        'd.address_line_7',
      ]);

      const result = classifyAndCleanMarkers(markers);

      expect(result.valid).toEqual(
        new Set([
          'address_line_1',
          'address_line_2',
          'address_line_3',
          'address_line_4',
          'address_line_5',
          'address_line_6',
          'address_line_7',
        ])
      );
    });
  });

  describe('invalid-non-renderable markers', () => {
    it('classifies c.* markers as non-renderable', () => {
      const result = classifyAndCleanMarkers(new Set(['c.conditional']));

      expect(result['invalid-non-renderable']).toEqual(new Set(['c.conditional']));
      expect(result.valid).toEqual(new Set());
    });

    it('classifies o.* markers as non-renderable', () => {
      const result = classifyAndCleanMarkers(new Set(['o.object']));

      expect(result['invalid-non-renderable']).toEqual(new Set(['o.object']));
    });

    it('classifies $* markers as non-renderable', () => {
      const result = classifyAndCleanMarkers(new Set(['$variable']));

      expect(result['invalid-non-renderable']).toEqual(new Set(['$variable']));
    });

    it('classifies #* markers as non-renderable', () => {
      const result = classifyAndCleanMarkers(new Set(['#hash']));

      expect(result['invalid-non-renderable']).toEqual(new Set(['#hash']));
    });

    it('classifies t() translation markers as non-renderable', () => {
      const result = classifyAndCleanMarkers(new Set(['t(translation_key)']));

      expect(result['invalid-non-renderable']).toEqual(
        new Set(['t(translation_key)'])
      );
    });
  });

  describe('invalid-renderable markers', () => {
    it('classifies markers without d. prefix as invalid-renderable', () => {
      const result = classifyAndCleanMarkers(new Set(['foo']));

      expect(result['invalid-renderable']).toEqual(new Set(['foo']));
      expect(result.valid).toEqual(new Set());
    });

    it('classifies d.foo.bar (complex path) as invalid-renderable', () => {
      const result = classifyAndCleanMarkers(new Set(['d.foo.bar']));

      // The marker is sliced to 'foo.bar' and then classified as invalid-renderable
      expect(result['invalid-renderable']).toEqual(new Set(['foo.bar']));
      expect(result.valid).toEqual(new Set());
    });

    it('classifies d.foo[0] (array access) as invalid-renderable', () => {
      const result = classifyAndCleanMarkers(new Set(['d.foo[0]']));

      expect(result['invalid-renderable']).toEqual(new Set(['foo[0]']));
    });

    it('classifies d.foo:bar (colon in name) as invalid-renderable', () => {
      const result = classifyAndCleanMarkers(new Set(['d.foo:bar']));

      expect(result['invalid-renderable']).toEqual(new Set(['foo:bar']));
    });
  });

  describe('mixed markers', () => {
    it('classifies a mix of markers correctly', () => {
      const markers = new Set([
        'd.valid_marker',
        'd.another-valid',
        'd.complex.path',
        'c.conditional',
        'no_prefix',
        't(translate)',
      ]);

      const result = classifyAndCleanMarkers(markers);

      expect(result.valid).toEqual(new Set(['valid_marker', 'another-valid']));
      expect(result['invalid-renderable']).toEqual(
        new Set(['complex.path', 'no_prefix'])
      );
      expect(result['invalid-non-renderable']).toEqual(
        new Set(['c.conditional', 't(translate)'])
      );
    });
  });
});
