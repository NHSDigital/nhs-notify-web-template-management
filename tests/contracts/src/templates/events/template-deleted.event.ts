import { randomUUID } from 'node:crypto';

export function createTemplateDeletedEvent() {
  return {
    'detail-type': 'TemplateDeleted',
    source: 'uk.nhs.notify.templates',
    time: new Date().toISOString(),
    version: '1.0',
    detail: {
      owner: randomUUID(),
      id: randomUUID(),
    },
  };
}
