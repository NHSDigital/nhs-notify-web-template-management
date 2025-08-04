/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'node:fs';
import path from 'node:path';
import { $TemplateDraftedEventV1 } from '../../src/events/template-drafted';

const examplesDir = path.resolve(
  __dirname,
  '../../examples/TemplateDrafted/v1'
);

describe('TemplateDraftedEventV1 Zod schema', () => {
  it.each(fs.readdirSync(examplesDir))(
    'parses sample event %s without errors',
    (filename) => {
      const event = JSON.parse(
        fs.readFileSync(path.join(examplesDir, filename), 'utf8')
      );

      const result = $TemplateDraftedEventV1.safeParse(event);

      if (!result.success) {
        console.log(result.error);
      }

      expect(result.success).toBe(true);
    }
  );
});
