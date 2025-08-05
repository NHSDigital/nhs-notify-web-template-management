/**
 * Replaces variables within a template string using a variables object, and supports pluralisation.
 *
 * Supports:
 * - simple variable interpolation: `{{name}}`
 * - pluralisation: `{{variable|singular|plural}}`
 *
 * Example:
 * ```ts
 * interpolate('Hello {{name}}, you have {{count}} {{count|message|messages}}.', {
 *   name: 'John',
 *   count: 2,
 * });
 * // => 'Hello John, you have 2 messages.'
 *  * interpolate('Hello {{name}}, you have {{count}} {{count|message|messages}}.', {
 *   name: 'John',
 *   count: 1,
 * });
 * // => 'Hello John, you have 1 message.'
 * ```
 *
 * @param template - The string containing `{{...}}` placeholders
 * @param variables - An object of variables
 * @returns The interpolated string
 */
// the following regex is bounded, avoids nested repetition, and is safe for controlled templates
// eslint-disable-next-line security/detect-unsafe-regex, sonarjs/slow-regex
const interpolationPattern = /{{\s*(\w+)(?:\|([^|]+)\|([^|]+))?\s*}}/g;

export function interpolate(
  template: string,
  variables: Record<string, string | number> = {}
): string {
  // eslint-disable-next-line unicorn/prefer-string-replace-all
  return template.replace(interpolationPattern, (_, token) => {
    const parts = token.split('|').map((part: string) => part.trim());

    if (parts.length === 3) {
      const [variable, singular, plural] = parts;
      const value = Number(variables[variable]);
      if (Number.isNaN(value)) return plural;
      return value === 1 ? singular : plural;
    }

    const value = variables[parts[0]];
    return value == null ? '' : String(value);
  });
}
