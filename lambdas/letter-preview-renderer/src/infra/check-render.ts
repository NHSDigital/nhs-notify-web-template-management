import { PDFDocument } from 'pdf-lib';

export class CheckRender {
  async pageCount(pdf: Buffer): Promise<number> {
    const doc = await PDFDocument.load(pdf);
    return doc.getPageCount();
  }
}
