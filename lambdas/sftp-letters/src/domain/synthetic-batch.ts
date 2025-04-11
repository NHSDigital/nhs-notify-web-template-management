import { format } from 'date-fns';
import { createHash } from 'node:crypto';
import {
  pdsPersonalisationKeys,
  staticPdsExampleData,
} from './static-batch-data';

export type Manifest = {
  template: string;
  batch: string;
  records: string;
  md5sum: string;
};

export class SyntheticBatch {
  constructor(
    private readonly randomId: () => string,
    private readonly getDate: () => Date
  ) {}

  buildBatch(
    templateId: string,
    fields: string[],
    userTestData?: Record<string, string>[]
  ): Record<string, string>[] {
    const date = this.getDate();

    return Array.from({ length: 3 }, (_, i) => {
      const fieldEntries = [
        ['clientRef', this.clientRef(date)],
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
      ];

      return Object.fromEntries(fieldEntries);
    });
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
      return pdsData[field];
    }
    return userData?.[field];
  }

  private clientRef(date: Date) {
    return [
      this.randomId(),
      this.randomId(),
      date.getTime().toString().slice(0, 10),
    ].join('_');
  }

  getId(templateId: string, pdfVersion: string) {
    const pseudoRandomSegment = pdfVersion.replaceAll('-', '').slice(0, 27);
    return `${templateId}-0000000000000_${pseudoRandomSegment}`;
  }

  getHeader(fields: string[]) {
    return `clientRef,template,${fields.join(',')}`;
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
