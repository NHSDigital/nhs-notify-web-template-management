// Allows us to extract keys of T that only match type string as they are possible string | number | symbol
export type Prop<T> = Extract<keyof T, string>;

// Extracts type of the property from a given object
export type PropType<TObj, TProp extends Prop<TObj>> = TObj[TProp];
