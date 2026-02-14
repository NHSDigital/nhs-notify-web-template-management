type MarkerStatus = 'valid' | 'invalid-renderable' | 'invalid-non-renderable';

export function classifyAndCleanMarkers(
  carboneMarkers: string[]
): Record<MarkerStatus, string[]> {
  const markers: Record<MarkerStatus, string[]> = {
    valid: [],
    'invalid-renderable': [],
    'invalid-non-renderable': [],
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
      markers['invalid-non-renderable'].push(marker);
      continue;
    }

    if (!marker.startsWith('d.')) {
      markers['invalid-renderable'].push(marker);
      continue;
    }

    const dataMarker = marker.slice(2);

    if (!/^[A-Z_a-z-]+$/.test(dataMarker)) {
      markers['invalid-renderable'].push(dataMarker);
      continue;
    }

    markers.valid.push(dataMarker);
  }

  return markers;
}
