import { format } from 'date-fns';
import type { TestCustomPersonalisation } from './test-data';
import { createHash } from 'node:crypto';
import {
  pdsPersonalisationKeys,
  staticPdsExampleData,
} from './static-batch-data';

export type BatchDetails = {
  id: string;
  rows: Record<string, string>[];
  header: string;
};

export type Manifest = {
  template: string;
  batch: string;
  records: string;
  md5sum: string;
};

export class Batch {
  constructor(
    private readonly randomId: () => string,
    private readonly getDate: () => Date
  ) {}

  buildBatch(
    templateId: string,
    fields: string[],
    userTestData?: TestCustomPersonalisation
  ): BatchDetails {
    const date = new Date();

    const id = `${templateId}-${this.getDate().getTime()}_${this.randomId()}`;

    const header = `clientRef,template,${fields.join(',')}`;

    const rows = Array.from({ length: 3 }, (_, i) =>
      Object.fromEntries([
        ['clientRef', this.clientRef()],
        ['template', templateId],
        ...fields.map((field) => {
          const value = this.fieldValue(
            field,
            date,
            staticPdsExampleData[i],
            userTestData?.[i]
          );
          return [field, value];
        }),
      ])
    );

    return { id, rows, header };
  }

  private fieldValue(
    field: string,
    date: Date,
    pdsData: Record<string, string>,
    userData?: Record<string, string>
  ) {
    if (field === 'date') {
      return format(date, 'd LLLL yyyy');
    }
    if (pdsPersonalisationKeys.includes(field)) {
      return pdsData[field] ?? '';
    }
    return userData?.[field] ?? '';
  }

  private clientRef() {
    return [
      this.randomId(),
      this.randomId(),
      this.getDate().toString().slice(10),
    ].join('_');
  }

  buildManifest(
    templateId: string,
    batchId: string,
    batchCsv: string
  ): Manifest {
    return {
      template: templateId,
      batch: `${batchId}.csv`,
      records: '3',
      // eslint-disable-next-line sonarjs/hashing
      md5sum: createHash('md5').update(batchCsv).digest('hex'),
    };
  }
}
