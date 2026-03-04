

describe('$RenderRequest', () => {
  test.each([[1, 2], [2, 4]])(
    'double(%d)',
    (input, expected) => {
      expect(double(input)).toBe(expected);
    }
  );
});
