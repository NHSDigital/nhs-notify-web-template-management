/* istanbul ignore file */
/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'node:fs';
import path from 'node:path';

function readPackageJson(dir: string) {
  const pgk = path.join(dir, 'package.json');

  if (!fs.existsSync(pgk)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(pgk, 'utf8'));
}

function atFsRoot(dir: string) {
  const parent = path.dirname(dir);
  return parent === dir;
}

function findMonorepoRoot(startDir: string) {
  const current = path.resolve(startDir);
  const pkg = readPackageJson(current);

  if (pkg?.workspaces) return current;
  if (atFsRoot(current)) return null;

  return findMonorepoRoot(path.dirname(current));
}

function findThisPackageRoot(startDir: string) {
  const current = path.resolve(startDir);
  const pkg = readPackageJson(current);

  if (pkg) return current;
  if (atFsRoot(current)) {
    throw new Error('No package.json found');
  }

  return findThisPackageRoot(path.dirname(current));
}

function findPackageInNodeModules(root: string, packageName: string) {
  const modulesDir = path.join(root, 'node_modules');
  if (!fs.existsSync(modulesDir)) {
    return null;
  }

  const packageSegments = packageName.split('/');

  let current = modulesDir;

  while (packageSegments.length > 0) {
    const currentSegment = packageSegments.shift() as string;

    current = path.join(current, currentSegment);

    if (!fs.existsSync(current)) {
      return null;
    }
  }

  return current;
}

function getPackageInstallDirectory(packageName: string): string {
  const packageRoot = findThisPackageRoot(__dirname);

  if (packageRoot && fs.existsSync(path.join(packageRoot, 'node_modules'))) {
    const found = findPackageInNodeModules(packageRoot, packageName);

    if (found) return found;
  }

  const monorepoRoot = findMonorepoRoot(__dirname);

  if (monorepoRoot && fs.existsSync(path.join(monorepoRoot, 'node_modules'))) {
    const found = findPackageInNodeModules(monorepoRoot, packageName);

    if (found) return found;
  }

  throw new Error(
    `Unable to find install location for package "${packageName}"`
  );
}

function loadSamplesForEventType(
  base: string,
  eventType: string,
  version: string
) {
  const examplesDir = path.join(base, 'examples', eventType, version);

  return fs
    .readdirSync(examplesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => [
      `${eventType}-${path.parse(entry.name).name}`,
      () =>
        JSON.parse(fs.readFileSync(path.join(examplesDir, entry.name), 'utf8')),
    ]);
}

export function getMessageProviders() {
  const base = getPackageInstallDirectory(
    '@nhsdigital/nhs-notify-event-schemas-template-management'
  );

  const eventTypes = [
    'TemplateCompleted',
    'TemplateDeleted',
    'TemplateDrafted',
    'RoutingConfigCompleted',
    'RoutingConfigDeleted',
    'RoutingConfigDrafted',
  ];

  return Object.fromEntries(
    eventTypes.flatMap((eventType) =>
      loadSamplesForEventType(base, eventType, 'v1')
    )
  );
}

export function getPactUrls(consumerPackage: string) {
  const base = findThisPackageRoot(__dirname);

  const pactsDir = path.join(
    base,
    '.contracts',
    consumerPackage,
    'pacts/template-management'
  );

  if (!fs.existsSync(pactsDir)) {
    throw new Error(`No pact files found at ${pactsDir}`);
  }

  return fs
    .readdirSync(pactsDir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name));
}
