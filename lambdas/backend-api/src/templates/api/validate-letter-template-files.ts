import { z } from 'zod';
import type { TemplateFileScannedEventDetail } from 'nhs-notify-web-template-management-utils';
import type { LetterUploadRepository, TemplateRepository } from '../infra';
import { TemplatePdf } from '../domain/template-pdf';
import { TestDataCsv } from '../domain/test-data-csv';
import { validateLetterTemplateFiles } from '../domain/validate-letter-template-files';
import { logger } from 'nhs-notify-web-template-management-utils/logger';

type ValidateLetterTemplateFilesLambdaInput = {
  detail: TemplateFileScannedEventDetail;
};

const $ValidateLetterTemplateFilesLambdaInput: z.ZodType<ValidateLetterTemplateFilesLambdaInput> =
  z.object({
    detail: z.object({
      template: z.object({
        id: z.string(),
        owner: z.string(),
      }),
      fileType: z.enum(['pdf-template', 'test-data']),
      versionId: z.string(),
      virusScanStatus: z.enum(['PASSED']),
    }),
  });

export const createHandler =
  ({
    letterUploadRepository,
    templateRepository,
  }: {
    letterUploadRepository: LetterUploadRepository;
    templateRepository: TemplateRepository;
  }) =>
  async (event: unknown) => {
    const { detail } = $ValidateLetterTemplateFilesLambdaInput.parse(event);

    const log = logger.child({ detail });

    const { template: templateKey, versionId } = detail;

    const getTemplateResult = await templateRepository.get(
      templateKey.id,
      templateKey.owner
    );

    if (getTemplateResult.error) {
      log.error('Unable to load template data', getTemplateResult.error);

      throw new Error('Unable to load template data');
    }

    const pdfData = getTemplateResult.data.files?.pdfTemplate;
    const csvData = getTemplateResult.data.files?.testDataCsv;

    //  No-op if some of the files have failed virus scan, or if file version in event is non-current
    if (
      pdfData?.virusScanStatus === 'FAILED' ||
      pdfData?.currentVersion !== versionId
    ) {
      log.info(
        'PDF has failed virus scan or event is for non-current version',
        { pdfData }
      );
      return;
    }

    if (
      csvData &&
      (csvData.virusScanStatus === 'FAILED' ||
        csvData.currentVersion !== versionId)
    ) {
      log.info(
        'CSV has failed virus scan or event is for non-current version',
        { csvData }
      );
      return;
    }

    // Back to queue // dlq if not all files have been scanned
    if (
      pdfData.virusScanStatus === 'PENDING' ||
      (csvData && csvData.virusScanStatus === 'PENDING')
    ) {
      log.info('Not all files have been scanned', { csvData, pdfData });
      throw new Error('Not all files have been scanned');
    }

    const downloads = [
      letterUploadRepository.download(templateKey, 'pdf-template', versionId),
    ];

    if (csvData) {
      downloads.push(
        letterUploadRepository.download(templateKey, 'test-data', versionId)
      );
    }

    const [pdfBuff, csvBuff] = await Promise.all(downloads);

    // Back to queue // dlq if not all files have been copied
    if (!pdfBuff || (csvData && !csvBuff)) {
      log.info('Not all files are available to download');
      throw new Error('Not all files are available to download');
    }

    const pdf = new TemplatePdf(pdfBuff);
    let csv;

    try {
      await pdf.parse();

      if (csvBuff) {
        csv = new TestDataCsv(csvBuff);

        csv.parse();
      }
    } catch (error) {
      log.error('File parsing error:', error);

      await templateRepository.setLetterValidationResult(
        templateKey,
        versionId,
        false,
        [],
        []
      );

      return;
    }

    const valid = validateLetterTemplateFiles(pdf, csv);

    await templateRepository.setLetterValidationResult(
      templateKey,
      versionId,
      valid,
      pdf.personalisationParameters,
      csv?.headers || []
    );
  };
