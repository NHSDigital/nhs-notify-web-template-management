type MarkerStatus = 'valid' | 'invalid-renderable' | 'invalid-non-renderable';

export function classifyAndCleanMarkers(
  carboneMarkers: Set<string>
): Record<MarkerStatus, Set<string>> {
  const markers: Record<MarkerStatus, Set<string>> = {
    valid: new Set<string>(),
    'invalid-renderable': new Set<string>(),
    'invalid-non-renderable': new Set<string>(),
  };

  for (const marker of carboneMarkers) {
    if (
      /*
       * these will be rendered by carbone as empty strings
       * or in the case of 't(x)' as 'x'
       * therefore we won't render at all if these are present
       */
      marker.startsWith('c.') ||
      marker.startsWith('o.') ||
      marker.startsWith('$') ||
      marker.startsWith('#') ||
      /^t\(.*\)/.test(marker)
    ) {
      markers['invalid-non-renderable'].add(marker);
      continue;
    }

    if (!marker.startsWith('d.')) {
      markers['invalid-renderable'].add(marker);
      continue;
    }

    const dataMarker = marker.slice(2);

    if (!/^[A-Z_a-z-]+$/.test(dataMarker)) {
      markers['invalid-renderable'].add(dataMarker);
      continue;
    }

    markers.valid.add(dataMarker);
  }

  return markers;
}
