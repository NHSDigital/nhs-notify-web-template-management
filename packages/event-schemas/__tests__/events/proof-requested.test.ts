/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'node:fs';
import path from 'node:path';
import { $ProofRequestedEventV1 } from '../../src/events/proof-requested';

const examplesDir = path.resolve(__dirname, '../../examples/ProofRequested/v1');

describe('ProofRequestedEventV1 Zod schema', () => {
  it.each(fs.readdirSync(examplesDir))(
    'parses sample event %s without errors',
    (filename) => {
      const event = JSON.parse(
        fs.readFileSync(path.join(examplesDir, filename), 'utf8')
      );

      const result = $ProofRequestedEventV1.safeParse(event);

      if (!result.success) {
        console.log(result.error);
      }

      expect(result.success).toBe(true);
    }
  );
});
