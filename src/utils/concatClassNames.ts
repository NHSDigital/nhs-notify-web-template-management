type ClassName = string | undefined | false | null;

export default function concatClassNames(...classNames: ClassName[]): string {
  return classNames
    .filter(Boolean)
    .map((className) => className)
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
