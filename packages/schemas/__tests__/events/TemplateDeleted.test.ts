import fs from 'node:fs';
import path from 'node:path';
import { $TemplateDeletedEvent } from '../../src/events/TemplateDeleted';

const examplesDir = path.resolve(
  __dirname,
  '../../sample-events/TemplateDeleted'
);

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
