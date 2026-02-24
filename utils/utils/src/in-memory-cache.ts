type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export class InMemoryCache<T> {
  private readonly cache = new Map<string, CacheEntry<T>>();

  constructor(private readonly cacheTtlMs: number) {}

  get(key: string): T | undefined {
    const cached = this.cache.get(key);

    if (!cached) {
      return;
    }

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return;
    }

    return cached.value;
  }

  set(key: string, value: T) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.cacheTtlMs,
    });
  }

  clear() {
    this.cache.clear();
  }
}
