import {
  ADDRESS_PERSONALISATIONS,
  DEFAULT_PERSONALISATION_LIST,
} from 'nhs-notify-backend-client/src/schemas/constants';
import { classifyAndCleanMarkers } from './markers';

function hasAllAddressLines(markers: Set<string>): boolean {
  return ADDRESS_PERSONALISATIONS.map((line) => markers.has(line)).every(
    Boolean
  );
}

function addressLineCount(markers: Set<string>): number {
  return [...markers].filter((m) => m.startsWith('address_line_')).length;
}

function getPassthroughPersonalisation(keys: string[]): Record<string, string> {
  return Object.fromEntries([...keys].map((key) => [key, `d.${key}`]));
}

function classifyPersonalisation(parameters: string[]) {
  const custom = [];
  const system = [];

  for (const parameter of parameters) {
    if (DEFAULT_PERSONALISATION_LIST.includes(parameter)) {
      system.push(parameter);
    } else {
      custom.push(parameter);
    }
  }

  return { custom, system };
}

export function getPersonalisation(markers: Set<string>) {
  const cleaned = classifyAndCleanMarkers(markers);

  const hasAddressLines = hasAllAddressLines(cleaned.valid);

  const hasSevenAddressLines = addressLineCount(markers) === 7;

  const personalisation = classifyPersonalisation([...cleaned.valid]);

  const passthroughPersonalisation = getPassthroughPersonalisation([
    ...cleaned.valid,
    ...cleaned['invalid-renderable'],
  ]);

  return {
    personalisation,
    hasAddressLines,
    hasSevenAddressLines,
    nonRenderablePersonalisation: [...cleaned['invalid-non-renderable']],
    invalidRenderablePersonalisation: [...cleaned['invalid-renderable']],
    passthroughPersonalisation,
  };
}
