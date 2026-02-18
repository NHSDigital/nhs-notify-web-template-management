import type { LetterValidationErrorDetail } from 'nhs-notify-backend-client/src/types/generated/types.gen';
import {
  ADDRESS_PERSONALISATIONS,
  DEFAULT_PERSONALISATION_LIST,
} from 'nhs-notify-backend-client/src/schemas/constants';

type MarkerStatus = 'valid' | 'invalid-renderable' | 'invalid-non-renderable';

function classifyAndCleanMarkers(
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

    if (!/^[\w-]+$/.test(dataMarker)) {
      markers['invalid-renderable'].add(dataMarker);
      continue;
    }

    markers.valid.add(dataMarker);
  }

  return markers;
}

function hasAllAddressLines(markers: Set<string>): boolean {
  return ADDRESS_PERSONALISATIONS.map((line) => markers.has(line)).every(
    Boolean
  );
}

function getPassthroughPersonalisation(
  keys: Set<string>
): Record<string, string> {
  return Object.fromEntries([...keys].map((key) => [key, `{d.${key}}`]));
}

function classifyPersonalisation(parameters: Set<string>) {
  const custom: string[] = [];
  const system: string[] = [];

  for (const parameter of parameters) {
    if (DEFAULT_PERSONALISATION_LIST.includes(parameter)) {
      system.push(parameter);
    } else {
      custom.push(parameter);
    }
  }

  return { custom, system };
}

export type MarkerAnalysis = {
  personalisation: { system: string[]; custom: string[] };
  passthroughPersonalisation: Record<string, string>;
  validationErrors: LetterValidationErrorDetail[];
  canRender: boolean;
};

export function analyseMarkers(markers: Set<string>): MarkerAnalysis {
  const classified = classifyAndCleanMarkers(markers);

  const personalisation = classifyPersonalisation(classified.valid);

  const passthroughPersonalisation = getPassthroughPersonalisation(
    classified.valid.union(classified['invalid-renderable'])
  );

  const validationErrors: LetterValidationErrorDetail[] = [];

  // Non-renderable markers prevent rendering entirely
  const hasNonRenderableMarkers = classified['invalid-non-renderable'].size > 0;

  // Invalid but renderable markers should be reported
  const invalidRenderableMarkers = [...classified['invalid-renderable']];
  if (invalidRenderableMarkers.length > 0 || hasNonRenderableMarkers) {
    const allInvalidMarkers = [
      ...classified['invalid-non-renderable'],
      ...invalidRenderableMarkers,
    ];
    validationErrors.push({
      name: 'INVALID_MARKERS',
      issues: allInvalidMarkers,
    });
  }

  // Check for missing address lines
  const hasMissingAddressLines = !hasAllAddressLines(classified.valid);
  if (hasMissingAddressLines) {
    validationErrors.push({
      name: 'MISSING_ADDRESS_LINES',
    });
  }

  return {
    personalisation,
    passthroughPersonalisation,
    validationErrors,
    canRender: !hasNonRenderableMarkers,
  };
}
