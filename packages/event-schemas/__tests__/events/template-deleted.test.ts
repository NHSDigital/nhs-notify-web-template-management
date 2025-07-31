/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'node:fs';
import path from 'node:path';
import { $TemplateDeletedEvent } from '../../src/events/template-deleted';

const examplesDir = path.resolve(__dirname, '../../examples/TemplateDeleted');

describe('TemplateCompletedEvent schema', () => {
  it.each(fs.readdirSync(examplesDir))(
    'parses sample event %s without errors',
    (filename) => {
      const event = JSON.parse(
        fs.readFileSync(path.join(examplesDir, filename), 'utf8')
      );

      const result = $TemplateDeletedEvent.safeParse(event);

      if (!result.success) {
        console.log(result.error);
      }

      expect(result.success).toBe(true);
    }
  );
});
