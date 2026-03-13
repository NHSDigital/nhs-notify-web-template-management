import type { ValidationErrorDetail } from 'nhs-notify-web-template-management-types';
import {
  ADDRESS_PERSONALISATIONS,
  DEFAULT_PERSONALISATION_LIST,
} from 'nhs-notify-backend-client/src/schemas/constants';

type Markers = {
  valid: string[];
  invalidRenderableData: string[];
  invalidRenderableNonData: string[];
  nonRenderable: string[];
};

function classifyMarkers(carboneMarkers: Set<string>): Markers {
  const valid: string[] = [];
  const invalidRenderableData: string[] = [];
  const invalidRenderableNonData: string[] = [];
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
      invalidRenderableNonData.push(marker);
      continue;
    }

    const dataMarker = marker.slice(2);

    if (!/^[\w-]+$/.test(dataMarker)) {
      invalidRenderableData.push(dataMarker);
      continue;
    }

    valid.push(dataMarker);
  }

  return {
    invalidRenderableData,
    invalidRenderableNonData,
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

function reconstructMarkers({
  valid,
  invalidRenderableData,
  invalidRenderableNonData,
  nonRenderable,
}: Markers): Markers {
  return {
    valid: valid.map((m) => passthroughData(m)),
    invalidRenderableData: invalidRenderableData.map((m) => passthroughData(m)),
    invalidRenderableNonData: invalidRenderableNonData.map((m) =>
      passthroughNonData(m)
    ),
    nonRenderable: nonRenderable.map((m) => passthroughNonData(m)),
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
  classified: Markers,
  reconstructed: Markers
): Record<string, string> {
  const keys = [
    ...classified.valid,
    ...classified.invalidRenderableData,
    ...classified.invalidRenderableNonData,
  ];
  const values = [
    ...reconstructed.valid,
    ...reconstructed.invalidRenderableData,
    ...reconstructed.invalidRenderableNonData,
  ];

  return Object.fromEntries(keys.map((k, i) => [k, values[i]]));
}

function buildValidationErrors(
  classified: Markers,
  reconstructed: Markers
): ValidationErrorDetail[] {
  const errors: ValidationErrorDetail[] = [];

  const invalidMarkers = [
    ...reconstructed.invalidRenderableData,
    ...reconstructed.nonRenderable,
    ...reconstructed.invalidRenderableNonData,
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
