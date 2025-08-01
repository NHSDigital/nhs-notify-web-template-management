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
export function interpolate(
  template: string,
  variables: Record<string, string | number> = {}
): string {
  return template.replace(/{{(.*?)}}/g, (_, token) => {
    const parts = token.trim().split('|');

    if (parts.length === 3) {
      const [variable, singular, plural] = parts;
      const value = Number(variables[variable]);
      if (isNaN(value)) return plural;
      return value === 1 ? singular : plural;
    }

    const value = variables[parts[0]];
    return value != null ? String(value) : '';
  });
}
