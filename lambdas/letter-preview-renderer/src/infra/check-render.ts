import { PDFDocument } from 'pdf-lib';
import { RenderFailureError } from '../types/errors';

export class CheckRender {
  async pageCount(pdf: Buffer): Promise<number> {
    try {
      const doc = await PDFDocument.load(pdf);
      return doc.getPageCount();
    } catch (error) {
      throw new RenderFailureError('page-count', error);
    }
  }
}
