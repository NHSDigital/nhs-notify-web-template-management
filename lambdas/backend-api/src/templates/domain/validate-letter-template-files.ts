import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { type TemplatePdf, ADDRESS_PERSONALISATIONS } from './template-pdf';
import type { TestDataCsv } from './test-data-csv';

export function validateLetterTemplateFiles(
  pdf: TemplatePdf,
  csv?: TestDataCsv
) {
  const correctAddressLength =
    pdf.addressLinePersonalisationParameters.length ===
    ADDRESS_PERSONALISATIONS.length;

  const correctAddressLines = pdf.addressLinePersonalisationParameters.every(
    (line, i) => line === ADDRESS_PERSONALISATIONS[i]
  );

  const customParametersSensiblyFormatted =
    pdf.customPersonalisationParameters.every((parameter) =>
      /^\w+$/.test(parameter)
    );

  const requiredTestFileExists =
    pdf.customPersonalisationParameters.length === 0 || Boolean(csv);

  let testFileHasExpectedNumberOfParameters = requiredTestFileExists;
  let allCustomPersonalisationIsInTestFile = requiredTestFileExists;

  if (csv) {
    testFileHasExpectedNumberOfParameters =
      pdf.customPersonalisationParameters.length === csv.parameters.length;

    allCustomPersonalisationIsInTestFile =
      pdf.customPersonalisationParameters.every((parameter) =>
        csv.parameters.includes(parameter)
      );
  }

  logger.info('Template file validation complete', {
    templateId: pdf.templateId,
    owner: pdf.owner,
    correctAddressLength,
    correctAddressLines,
    customParametersSensiblyFormatted,
    requiredTestFileExists,
    testFileHasExpectedNumberOfParameters,
    allCustomPersonalisationIsInTestFile,
  });

  return (
    correctAddressLength &&
    correctAddressLines &&
    customParametersSensiblyFormatted &&
    testFileHasExpectedNumberOfParameters &&
    allCustomPersonalisationIsInTestFile
  );
}
