/**
 * Returns an identity function which will fail to compile if 'array'
 * doesn't contain all the cases of 'Union'
 *
 * @example
 * const arrayOfFooBarBaz = arrayOfAll<'foo' | 'bar' | 'baz'>();
 *
 * const a = arrayOfFooBarBaz(['foo', 'bar']); // does not compile
 * const b = arrayOfFooBarBaz(['foo', 'bar', 'baz']); // compiles
 */
export function arrayOfAll<Union>() {
  return <T extends [Union, ...Union[]]>(
    array: T & ([Union] extends [T[number]] ? unknown : 'Invalid')
  ) => array;
}
