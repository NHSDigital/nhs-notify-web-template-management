import { isValidUuid } from '@utils/is-valid-uuid';

describe('isValidUuid', () => {
  it('returns true for valid UUID v4', () => {
    expect(isValidUuid('a3f1c2e4-5b6d-4e8f-9a2b-1c3d4e5f6a7b')).toBe(true);
    expect(isValidUuid('b7e2d3c4-8f9a-4b1c-9d2e-3f4a5b6c7d8e')).toBe(true);
  });

  it('returns false for invalid UUIDs', () => {
    expect(isValidUuid('not-a-uuid')).toBe(false);
    expect(isValidUuid('123456')).toBe(false);
    expect(isValidUuid('11111111-1111-1111-1111-111111111111')).toBe(false);
  });
});
