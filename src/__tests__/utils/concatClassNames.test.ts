import concatClassNames from '@/src/utils/concatClassNames';

describe('concatClassNames function', () => {
  it('calls the concatClassName function with string classes parameters separated by comma', () => {
    expect(concatClassNames('class1', 'class2')).toBe('class1 class2');
  });
  it('calls the concatClassName function without any parameters', () => {
    expect(concatClassNames()).toBe('');
  });
  it('calls the concatClassName function with undefined parameter', () => {
    expect(concatClassNames(undefined)).toBe('');
  });
  it('calls the concatClassName function with null parameter', () => {
    expect(concatClassNames(null)).toBe('');
  });
  it('calls the concatClassName function with false boolean parameter', () => {
    expect(concatClassNames(false)).toBe('');
  });
});
