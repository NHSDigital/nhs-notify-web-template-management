import { isValidUuidV4 } from '../valid-uuid';

describe('isValidUuidV4', () => {
  it('returns true for valid UUID v4', () => {
    expect(isValidUuidV4('123e4567-e89b-42d3-a456-426614174000')).toBe(true);
    expect(isValidUuidV4('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidUuidV4('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
  });

  it('returns false for invalid UUIDs', () => {
    expect(isValidUuidV4('not-a-uuid')).toBe(false);
    expect(isValidUuidV4('123e4567-e89b-12d3-a456-426614174000')).toBe(false);
    expect(isValidUuidV4('')).toBe(false);
    expect(isValidUuidV4('123e4567e89b42d3a456426614174000')).toBe(false);
    expect(isValidUuidV4('123e4567-e89b-42d3-a456-42661417400')).toBe(false);
    expect(isValidUuidV4('g47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(false);
  });
});
