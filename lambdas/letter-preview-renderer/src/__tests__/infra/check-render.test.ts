import { PDFDocument } from 'pdf-lib';
import { CheckRender } from '../../infra/check-render';

function setup() {
  return new CheckRender();
}

describe('CheckRender', () => {
  describe('pageCount', () => {
    test('returns the number of pages in a PDF', async () => {
      const checkRender = setup();

      const pdfDoc = await PDFDocument.create();
      pdfDoc.addPage();
      pdfDoc.addPage();
      pdfDoc.addPage();

      const pdfBytes = await pdfDoc.save();

      const result = await checkRender.pageCount(Buffer.from(pdfBytes));

      expect(result).toBe(3);
    });

    test('returns 1 for a single page PDF', async () => {
      const checkRender = setup();

      const pdfDoc = await PDFDocument.create();
      pdfDoc.addPage();

      const pdfBytes = await pdfDoc.save();

      const result = await checkRender.pageCount(Buffer.from(pdfBytes));

      expect(result).toBe(1);
    });

    test('throws when given invalid PDF data', async () => {
      const checkRender = setup();

      await expect(
        checkRender.pageCount(Buffer.from('not-a-pdf'))
      ).rejects.toThrow();
    });
  });
});
