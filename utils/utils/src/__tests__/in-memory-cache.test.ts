import { InMemoryCache } from '../in-memory-cache';

describe('InMemoryCache', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns undefined for a missing key', () => {
    const cache = new InMemoryCache<string>(1000);

    expect(cache.get('missing')).toBeUndefined();
  });

  it('returns cached value before ttl expiry', () => {
    const cache = new InMemoryCache<string>(1000);

    cache.set('key', 'value');

    expect(cache.get('key')).toBe('value');
  });

  it('returns undefined after ttl expiry', () => {
    const cache = new InMemoryCache<string>(5);
    const nowSpy = jest.spyOn(Date, 'now');

    nowSpy.mockReturnValueOnce(1000);
    cache.set('key', 'value');

    nowSpy.mockReturnValueOnce(1020);

    expect(cache.get('key')).toBeUndefined();
  });

  it('clears all cached values', () => {
    const cache = new InMemoryCache<string>(1000);

    cache.set('first', 'one');
    cache.set('second', 'two');

    cache.clear();

    expect(cache.get('first')).toBeUndefined();
    expect(cache.get('second')).toBeUndefined();
  });
});
