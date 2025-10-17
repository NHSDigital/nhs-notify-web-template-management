export type OpenApiToTemplate<S extends string> =
  S extends `${infer A}{${string}}${infer B}`
    ? OpenApiToTemplate<`${A}${string}${B}`>
    : S;
