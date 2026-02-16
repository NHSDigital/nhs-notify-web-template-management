import { classifyAndCleanMarkers } from './markers';

function hasAllAddressLines(markers: Set<string>): boolean {
  return [1, 2, 3, 4, 5, 6, 7]
    .map((n) => markers.has(`address_line_${n}`))
    .every(Boolean);
}

function getPassthroughPersonalisation(
  valid: Set<string>
): Record<string, string> {
  return Object.fromEntries([...valid].map((key) => [key, `d.${key}`]));
}

export function getPersonalisation(markers: Set<string>) {
  const cleaned = classifyAndCleanMarkers(markers);

  const hasAddressLines = hasAllAddressLines(cleaned.valid);

  const passthroughPersonalisation = getPassthroughPersonalisation(
    cleaned.valid
  );

  return {
    hasAddressLines,
    nonRenderablePersonalisation: [...cleaned['invalid-non-renderable']],
    invalidRenderablePersonalisation: [...cleaned['invalid-renderable']],
    passthroughPersonalisation,
  };
}
