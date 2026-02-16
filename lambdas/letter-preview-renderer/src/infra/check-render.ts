import { PDFDocument } from 'pdf-lib';
import { failure, type Result, success } from '../types/result';

export class CheckRender {
  async pageCount(pdf: Buffer): Promise<Result<number>> {
    try {
      const doc = await PDFDocument.load(pdf);
      return success(doc.getPageCount());
    } catch (error) {
      return failure(error);
    }
  }
}
