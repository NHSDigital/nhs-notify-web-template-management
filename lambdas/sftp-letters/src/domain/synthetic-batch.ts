import { format } from 'date-fns';
import { createHash } from 'node:crypto';
import {
  pdsPersonalisationKeys,
  staticPdsExampleData,
} from './synthetic-batch-data';

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
    supplierReference: string,
    fields: string[],
    userTestData?: Record<string, string>[]
  ): Record<string, string>[] {
    const date = this.getDate();

    return Array.from({ length: staticPdsExampleData.length }, (_, i) => {
      const fieldEntries = [
        ['clientRef', this.clientRef(date)],
        ['template', supplierReference],
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

  getId(supplierReference: string, pdfVersion: string) {
    const pseudoRandomSegment = pdfVersion.replaceAll('-', '').slice(0, 27);

    // 0000000000000 stands in for a timestamp in a real batch ID
    return `${supplierReference}-0000000000000_${pseudoRandomSegment}`;
  }

  getHeader(fields: string[]) {
    return `clientRef,template,${fields.join(',')}`;
  }

  buildManifest(
    supplierReference: string,
    batchId: string,
    batchCsv: string
  ): Manifest {
    return {
      template: supplierReference,
      batch: `${batchId}.csv`,
      records: staticPdsExampleData.length.toString(),
      // eslint-disable-next-line sonarjs/hashing
      md5sum: createHash('md5').update(batchCsv).digest('hex'),
    };
  }
}
