type ClassName = string | undefined | false;

export default function concatClassNames(...classNames: ClassName[]): string {
  return classNames
    .filter(Boolean)
    .map((className) => className)
    .join(' ')
    .replaceAll(/\s{2,}/g, ' ')
    .trim();
}
