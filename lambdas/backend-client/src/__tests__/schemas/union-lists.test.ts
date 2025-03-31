import {
  arrayOfAll,
  LANGUAGE_LIST,
  LETTER_TYPE_LIST,
  TEMPLATE_STATUS_LIST,
  TEMPLATE_TYPE_LIST,
  VIRUS_SCAN_STATUS_LIST,
} from '../../schemas/union-lists';

describe('arrayOfAll', () => {
  type Union = 'a' | 'b' | 'c';

  test('compiles when all cases of the union are in the array, order is ignored', () => {
    expect(arrayOfAll<Union>()(['c', 'b', 'a'])).toEqual(['c', 'b', 'a']);
  });

  test('does not compile if a case is missing', () => {
    const a: Union[] = ['a', 'b', 'c'];

    // @ts-expect-error `Type 'Union[]' is not assignable to type '"Invalid"'.`
    expect(arrayOfAll<Union | 'd'>()(a)).toEqual(a);
  });

  test('does not compile if extra cases are present in the array', () => {
    const a: Array<Union | 'd'> = ['a', 'b', 'c', 'd'];

    // @ts-expect-error `Type '"d"' is not assignable to type 'Union'.`
    expect(arrayOfAll<Union>()(a)).toEqual(a);
  });
});

describe('Union lists', () => {
  test.each([
    { name: 'TemplateType', list: TEMPLATE_TYPE_LIST },
    { name: 'TemplateStatus', list: TEMPLATE_STATUS_LIST },
    { name: 'Language', list: LANGUAGE_LIST },
    { name: 'LetterType', list: LETTER_TYPE_LIST },
    { name: 'VirusScanStatus', list: VIRUS_SCAN_STATUS_LIST },
  ])('$name list contains no duplicates', ({ list }) => {
    expect(list.length).toEqual(new Set(list).size);
  });
});
