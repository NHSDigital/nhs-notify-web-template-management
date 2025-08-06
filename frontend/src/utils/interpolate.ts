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
 *
 * interpolate('Hello {{name}}, you have {{count}} {{count|message|messages}}.', {
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

// eslint-disable-next-line security/detect-unsafe-regex, sonarjs/slow-regex
const interpolationPattern = /{{\s*([^|}]+)(?:\|([^|}]+)\|([^}]+))?\s*}}/g;

export function interpolate(
  template: string,
  variables: Record<string, string | number> = {}
): string {
  // eslint-disable-next-line unicorn/prefer-string-replace-all
  return template.replace(
    interpolationPattern,
    (_match, variable, singular, plural) => {
      const key = variable.trim();
      const value = variables[key];

      if (singular !== undefined && plural !== undefined) {
        const count = Number(value);

        if (Number.isNaN(count)) return plural;
        return count === 1 ? singular : plural;
      }

      return value == null ? '' : String(value);
    }
  );
}
