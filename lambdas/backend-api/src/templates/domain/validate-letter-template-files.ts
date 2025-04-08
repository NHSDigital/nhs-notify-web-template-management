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

  let testFileHasCorrectNumberOfColumns = requiredTestFileExists;
  let allCustomPersonalisationIsInTestFile = requiredTestFileExists;
  let allTestFileRowsContainCorrectNumberOfColumns = requiredTestFileExists;

  if (csv) {
    testFileHasCorrectNumberOfColumns =
      pdf.customPersonalisationParameters.length === csv.headers.length;

    allCustomPersonalisationIsInTestFile =
      pdf.customPersonalisationParameters.every((parameter) =>
        csv.headers.includes(parameter)
      );

    allTestFileRowsContainCorrectNumberOfColumns = csv.rows.every(
      (row) => row.length === csv.headers.length
    );
  }

  return (
    correctAddressLength &&
    correctAddressLines &&
    customParametersSensiblyFormatted &&
    allCustomPersonalisationIsInTestFile &&
    testFileHasCorrectNumberOfColumns &&
    allTestFileRowsContainCorrectNumberOfColumns
  );
}
