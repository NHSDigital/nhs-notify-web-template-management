import type { ValidationErrorDetail } from 'nhs-notify-backend-client/src/types/generated/types.gen';
import {
  ADDRESS_PERSONALISATIONS,
  DEFAULT_PERSONALISATION_LIST,
} from 'nhs-notify-backend-client/src/schemas/constants';

type ClassifiedMarkers = {
  valid: Set<string>;
  renderable: Set<string>;
  nonRenderable: Set<string>;
};

function classifyMarkers(carboneMarkers: Set<string>): ClassifiedMarkers {
  const valid = new Set<string>();
  const renderable = new Set<string>();
  const nonRenderable = new Set<string>();

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
      nonRenderable.add(marker);
      continue;
    }

    if (!marker.startsWith('d.')) {
      renderable.add(marker);
      continue;
    }

    const dataMarker = marker.slice(2);

    if (!/^[\w-]+$/.test(dataMarker)) {
      renderable.add(dataMarker);
      continue;
    }

    valid.add(dataMarker);
  }

  return { valid, renderable, nonRenderable };
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

function buildPassthroughPersonalisation(
  keys: Set<string>
): Record<string, string> {
  return Object.fromEntries([...keys].map((key) => [key, `{d.${key}}`]));
}

function buildValidationErrors(
  classified: ClassifiedMarkers
): ValidationErrorDetail[] {
  const errors: ValidationErrorDetail[] = [];

  const invalidMarkers = [
    ...classified.nonRenderable,
    ...classified.renderable,
  ];

  if (invalidMarkers.length > 0) {
    errors.push({ name: 'INVALID_MARKERS', issues: invalidMarkers });
  }

  const hasAllAddressLines = ADDRESS_PERSONALISATIONS.every((line) =>
    classified.valid.has(line)
  );

  if (!hasAllAddressLines) {
    errors.push({ name: 'MISSING_ADDRESS_LINES' });
  }

  const addressLinePattern = /^address_line_\d+$/;

  const unexpectedAddressLines = [...classified.valid].filter(
    (marker) =>
      addressLinePattern.test(marker) &&
      !ADDRESS_PERSONALISATIONS.includes(marker)
  );

  if (unexpectedAddressLines.length > 0) {
    errors.push({
      name: 'UNEXPECTED_ADDRESS_LINES',
      issues: unexpectedAddressLines,
    });
  }

  return errors;
}

export type MarkerAnalysis = {
  personalisation: { system: string[]; custom: string[] };
  passthroughPersonalisation: Record<string, string>;
  validationErrors: ValidationErrorDetail[];
  canRender: boolean;
};

export function analyseMarkers(markers: Set<string>): MarkerAnalysis {
  const classified = classifyMarkers(markers);

  return {
    personalisation: classifyPersonalisation(classified.valid),
    passthroughPersonalisation: buildPassthroughPersonalisation(
      classified.valid.union(classified.renderable)
    ),
    validationErrors: buildValidationErrors(classified),
    canRender: classified.nonRenderable.size === 0,
  };
}
