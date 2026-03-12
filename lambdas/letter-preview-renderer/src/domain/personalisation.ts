import type { ValidationErrorDetail } from 'nhs-notify-web-template-management-types';
import {
  ADDRESS_PERSONALISATIONS,
  DEFAULT_PERSONALISATION_LIST,
} from 'nhs-notify-backend-client/src/schemas/constants';

type ClassifiedMarkers = {
  valid: string[];
  invalidRenderableDataMarkers: string[];
  invalidRenderableNonDataMarkers: string[];
  nonRenderable: string[];
};

type ReconstructedMarkers = {
  valid: string[];
  invalidRenderableDataMarkers: string[];
  invalidRenderableNonDataMarkers: string[];
  nonRenderable: string[];
};

function classifyMarkers(carboneMarkers: Set<string>): ClassifiedMarkers {
  const valid: string[] = [];
  const invalidRenderableDataMarkers: string[] = [];
  const invalidRenderableNonDataMarkers: string[] = [];
  const nonRenderable: string[] = [];

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
      nonRenderable.push(marker);
      continue;
    }

    if (!marker.startsWith('d.')) {
      invalidRenderableNonDataMarkers.push(marker);
      continue;
    }

    const dataMarker = marker.slice(2);

    if (!/^[\w-]+$/.test(dataMarker)) {
      invalidRenderableDataMarkers.push(dataMarker);
      continue;
    }

    valid.push(dataMarker);
  }

  return {
    invalidRenderableDataMarkers,
    invalidRenderableNonDataMarkers,
    nonRenderable,
    valid,
  };
}

function passthroughData(s: string) {
  return `{d.${s}}`;
}

function passthroughNonData(s: string) {
  return `{${s}}`;
}

function reconstructMarkers(
  classified: ClassifiedMarkers
): ReconstructedMarkers {
  return {
    valid: classified.valid.map((m) => passthroughData(m)),
    invalidRenderableDataMarkers: classified.invalidRenderableDataMarkers.map(
      (m) => passthroughData(m)
    ),
    invalidRenderableNonDataMarkers:
      classified.invalidRenderableNonDataMarkers.map((m) =>
        passthroughNonData(m)
      ),
    nonRenderable: classified.nonRenderable.map((m) => passthroughNonData(m)),
  };
}

function classifyPersonalisation(parameters: string[]) {
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
  classified: ClassifiedMarkers,
  reconstructed: ReconstructedMarkers
): Record<string, string> {
  const keys = [
    ...classified.valid,
    ...classified.invalidRenderableDataMarkers,
    ...classified.invalidRenderableNonDataMarkers,
  ];
  const values = [
    ...reconstructed.valid,
    ...reconstructed.invalidRenderableDataMarkers,
    ...reconstructed.invalidRenderableNonDataMarkers,
  ];

  return Object.fromEntries(keys.map((k, i) => [k, values[i]]));
}

function buildValidationErrors(
  classified: ClassifiedMarkers,
  reconstructed: ReconstructedMarkers
): ValidationErrorDetail[] {
  const errors: ValidationErrorDetail[] = [];

  const invalidMarkers = [
    ...reconstructed.invalidRenderableDataMarkers,
    ...reconstructed.nonRenderable,
    ...reconstructed.invalidRenderableNonDataMarkers,
  ];

  if (invalidMarkers.length > 0) {
    errors.push({ name: 'INVALID_MARKERS', issues: invalidMarkers });
  }

  const hasAllAddressLines = ADDRESS_PERSONALISATIONS.every((line) =>
    classified.valid.includes(line)
  );

  if (!hasAllAddressLines) {
    errors.push({ name: 'MISSING_ADDRESS_LINES' });
  }

  const addressLinePattern = /^address_line_\d+$/;

  const unexpectedAddressLineIssues = classified.valid.flatMap((m, i) =>
    addressLinePattern.test(m) && !ADDRESS_PERSONALISATIONS.includes(m)
      ? [reconstructed.valid[i]]
      : []
  );

  if (unexpectedAddressLineIssues.length > 0) {
    errors.push({
      name: 'UNEXPECTED_ADDRESS_LINES',
      issues: unexpectedAddressLineIssues,
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
  const reconstructed = reconstructMarkers(classified);

  return {
    personalisation: classifyPersonalisation(classified.valid),
    passthroughPersonalisation: buildPassthroughPersonalisation(
      classified,
      reconstructed
    ),
    validationErrors: buildValidationErrors(classified, reconstructed),
    canRender: classified.nonRenderable.length === 0,
  };
}
