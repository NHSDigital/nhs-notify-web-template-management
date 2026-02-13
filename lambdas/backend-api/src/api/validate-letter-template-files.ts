import { logger } from 'nhs-notify-web-template-management-utils/logger';
import {
  guardDutyEventValidator,
  isRightToLeft,
} from 'nhs-notify-web-template-management-utils';
import type { PdfLetterFiles } from 'nhs-notify-backend-client';
import { LetterUploadRepository, TemplateRepository } from '../infra';
import { TemplatePdf } from '../domain/template-pdf';
import { TestDataCsv } from '../domain/test-data-csv';
import { validateLetterTemplateFiles } from '../domain/validate-letter-template-files';
import { SQSBatchItemFailure, SQSBatchResponse, SQSEvent } from 'aws-lambda';

export class ValidateLetterTemplateFilesLambda {
  private letterUploadRepository: LetterUploadRepository;

  private templateRepository: TemplateRepository;

  constructor({
    letterUploadRepository,
    templateRepository,
  }: {
    letterUploadRepository: LetterUploadRepository;
    templateRepository: TemplateRepository;
  }) {
    this.letterUploadRepository = letterUploadRepository;
    this.templateRepository = templateRepository;
  }

  sqsHandler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    const batchItemFailures: SQSBatchItemFailure[] = [];

    for (const record of event.Records) {
      try {
        await this.guardDutyHandler(JSON.parse(record.body));
      } catch (error) {
        logger
          .child({
            messageId: record.messageId,
          })
          .error('Failed processing record', error);

        batchItemFailures.push({ itemIdentifier: record.messageId });
      }
    }

    return { batchItemFailures };
  };

  guardDutyHandler = async (event: unknown) => {
    const { detail } = guardDutyEventValidator('PASSED').parse(event);

    const metadata = LetterUploadRepository.parseKey(
      detail.s3ObjectDetails.objectKey
    );

    const log = logger.child({ detail, metadata });

    const {
      'template-id': templateId,
      'client-id': clientId,
      'version-id': versionId,
    } = metadata;

    const { error: getTemplateError, data: template } =
      await this.templateRepository.get(templateId, clientId);

    if (getTemplateError) {
      log.error('Unable to load template data', getTemplateError);

      throw new Error('Unable to load template data');
    }

    if (template.letterVersion === 'AUTHORING' || !template.files) {
      log.error("Can't process non-PDF letter template");
      return;
    }

    const { pdfTemplate: pdfData, testDataCsv: csvData } = template.files;

    if (
      pdfData?.currentVersion !== versionId ||
      (csvData && csvData.currentVersion !== versionId)
    ) {
      //  No-op if file version in event is non-current
      log.info('Event is for non-current file version - skipping', {
        pdfData,
        csvData,
      });
      return;
    }

    if (template.templateStatus !== 'PENDING_VALIDATION') {
      log.info('Template is not pending validation - skipping', {
        templateStatus: template.templateStatus,
      });
      return;
    }

    if (
      pdfData.virusScanStatus === 'FAILED' ||
      (csvData && csvData.virusScanStatus === 'FAILED')
    ) {
      //  No-op if some of the files have failed virus scan, or if file version in event is non-current
      log.info('Template file has failed virus scan - skipping', {
        pdfData,
        csvData,
      });
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
      this.letterUploadRepository.download(
        templateId,
        clientId,
        'pdf-template',
        versionId
      ),
    ];

    if (csvData) {
      downloads.push(
        this.letterUploadRepository.download(
          templateId,
          clientId,
          'test-data',
          versionId
        )
      );
    }

    const [pdfBuff, csvBuff] = await Promise.all(downloads);

    // Back to queue // dlq if not all files have been copied
    if (!pdfBuff || (csvData && !csvBuff)) {
      log.info('Not all files are available to download');
      throw new Error('Not all files are available to download');
    }

    const pdf = new TemplatePdf({ templateId, clientId }, pdfBuff);

    const proofingEnabled = template.proofingEnabled || false;

    let csv;

    try {
      await pdf.parse();

      if (csvBuff) {
        csv = new TestDataCsv(csvBuff);

        csv.parse();
      }
    } catch (error) {
      log.error('File parsing error:', error);

      await this.templateRepository.setLetterValidationResult(
        { templateId, clientId },
        versionId,
        false,
        [],
        [],
        proofingEnabled
      );

      return;
    }

    const rtl = isRightToLeft(template.language || 'en');
    const valid = rtl || validateLetterTemplateFiles(pdf, csv);

    await this.templateRepository.setLetterValidationResult(
      { templateId, clientId },
      versionId,
      valid,
      pdf.personalisationParameters,
      csv?.parameters || [],
      proofingEnabled
    );
  };
}
