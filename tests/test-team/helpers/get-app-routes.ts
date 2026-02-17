import { execSync } from 'node:child_process';
import { glob } from 'glob';

export async function getAppRoutes(): Promise<string[]> {
  const projectRoot = execSync('/usr/bin/git rev-parse --show-toplevel', {
    encoding: 'utf8',
  }).trim();

  const pageTsxPaths = await glob(
    `${projectRoot}/frontend/src/app/**/page.tsx`
  );

  return pageTsxPaths.map((p) => {
    const dynamicStripped = p.replaceAll(/\/\[[^[]+]/g, '');

    const route = dynamicStripped
      .replace(/^.*\/src\/app\//, '') // strip everything before app/
      .replace(/\/page.tsx$/, ''); // strip trailing /page.tsx

    if (!route) {
      throw new Error(`failed to parse route for path: ${p}`);
    }

    return route;
  });
}
