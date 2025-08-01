import { interpolate } from '@utils/interpolate';

describe('interpolate', () => {
  it('replaces simple variables', () => {
    expect(interpolate('Hello {{name}}!', { name: 'Test' })).toBe(
      'Hello Test!'
    );
  });

  it('replaces plural based on value', () => {
    expect(interpolate('{{count|item|items}}', { count: 1 })).toBe('item');
    expect(interpolate('{{count|item|items}}', { count: 3 })).toBe('items');
  });

  it('replaces variable and plural in same string', () => {
    expect(interpolate('{{count}} {{count|item|items}}', { count: 2 })).toBe(
      '2 items'
    );
  });

  it('removes variable if missing', () => {
    expect(interpolate('Hello {{name}}!', {})).toBe('Hello !');
  });

  it('falls back to plural if count is invalid', () => {
    expect(interpolate('{{count|item|items}}', { count: 'not-a-number' })).toBe(
      'items'
    );
  });
});
