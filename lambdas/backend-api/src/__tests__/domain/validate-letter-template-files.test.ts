import { mock } from 'jest-mock-extended';
import { TemplatePdf } from '../../domain/template-pdf';
import { TestDataCsv } from '../../domain/test-data-csv';
import { validateLetterTemplateFiles } from '../../domain/validate-letter-template-files';

jest.mock('nhs-notify-web-template-management-utils/logger');

describe('pdf has no custom personalisation', () => {
  test('returns true if pdf contains expected address lines', () => {
    const pdf = mock<TemplatePdf>({
      customPersonalisationParameters: [],
      addressLinePersonalisationParameters: [
        'address_line_1',
        'address_line_2',
        'address_line_3',
        'address_line_4',
        'address_line_5',
        'address_line_6',
        'address_line_7',
      ],
    });

    expect(validateLetterTemplateFiles(pdf)).toBe(true);
  });

  test('returns false if pdf is missing address lines', () => {
    const pdf = mock<TemplatePdf>({
      customPersonalisationParameters: [],
      addressLinePersonalisationParameters: [
        'address_line_1',
        'address_line_2',
        'address_line_3',
        'address_line_4',
        'address_line_5',
        'address_line_6',
      ],
    });

    expect(validateLetterTemplateFiles(pdf)).toBe(false);
  });

  test('returns false if pdf has badly ordered address lines', () => {
    const pdf = mock<TemplatePdf>({
      customPersonalisationParameters: [],
      addressLinePersonalisationParameters: [
        'address_line_1',
        'address_line_7',
        'address_line_2',
        'address_line_3',
        'address_line_4',
        'address_line_5',
        'address_line_6',
      ],
    });

    expect(validateLetterTemplateFiles(pdf)).toBe(false);
  });

  test('returns true if empty csv file is provided', () => {
    const pdf = mock<TemplatePdf>({
      customPersonalisationParameters: [],
      addressLinePersonalisationParameters: [
        'address_line_1',
        'address_line_2',
        'address_line_3',
        'address_line_4',
        'address_line_5',
        'address_line_6',
        'address_line_7',
      ],
    });

    const csv = mock<TestDataCsv>({ parameters: [] });

    expect(validateLetterTemplateFiles(pdf, csv)).toBe(true);
  });

  test('returns false if non-empty csv file is provided', () => {
    const pdf = mock<TemplatePdf>({
      customPersonalisationParameters: [],
      addressLinePersonalisationParameters: [
        'address_line_1',
        'address_line_2',
        'address_line_3',
        'address_line_4',
        'address_line_5',
        'address_line_6',
        'address_line_7',
      ],
    });

    const csv = mock<TestDataCsv>({
      parameters: ['parameter_1'],
    });

    expect(validateLetterTemplateFiles(pdf, csv)).toBe(false);
  });
});

describe('pdf with custom personalisation', () => {
  test('returns false if no csv is provided', () => {
    const pdf = mock<TemplatePdf>({
      customPersonalisationParameters: ['parameter_1'],
      addressLinePersonalisationParameters: [
        'address_line_1',
        'address_line_2',
        'address_line_3',
        'address_line_4',
        'address_line_5',
        'address_line_6',
        'address_line_7',
      ],
    });

    expect(validateLetterTemplateFiles(pdf)).toBe(false);
  });

  test.each([
    { case: 'contains spaces', value: 'parameter 1' },
    { case: 'contains dashes', value: 'parameter-1' },
    { case: 'contains special characters', value: 'parameter_1!' },
  ])(
    'returns false if custom personalisation parameters are badly formatted - $case',
    ({ value }) => {
      const pdf = mock<TemplatePdf>({
        customPersonalisationParameters: [value],
        addressLinePersonalisationParameters: [
          'address_line_1',
          'address_line_2',
          'address_line_3',
          'address_line_4',
          'address_line_5',
          'address_line_6',
          'address_line_7',
        ],
      });

      const csv = mock<TestDataCsv>({
        parameters: [value],
      });

      expect(validateLetterTemplateFiles(pdf, csv)).toBe(false);
    }
  );

  test('returns false if csv is missing custom personalisation parameters', () => {
    const pdf = mock<TemplatePdf>({
      customPersonalisationParameters: ['parameter_1', 'parameter_2'],
      addressLinePersonalisationParameters: [
        'address_line_1',
        'address_line_2',
        'address_line_3',
        'address_line_4',
        'address_line_5',
        'address_line_6',
        'address_line_7',
      ],
    });

    const csv = mock<TestDataCsv>({
      parameters: ['parameter_2'],
    });

    expect(validateLetterTemplateFiles(pdf, csv)).toBe(false);
  });

  test('returns false if csv has too many custom personalisation parameters', () => {
    const pdf = mock<TemplatePdf>({
      customPersonalisationParameters: ['parameter_1'],
      addressLinePersonalisationParameters: [
        'address_line_1',
        'address_line_2',
        'address_line_3',
        'address_line_4',
        'address_line_5',
        'address_line_6',
        'address_line_7',
      ],
    });

    const csv = mock<TestDataCsv>({
      parameters: ['parameter_1', 'parameter_2'],
    });

    expect(validateLetterTemplateFiles(pdf, csv)).toBe(false);
  });

  test('returns false if csv has wrong custom personalisation parameters', () => {
    const pdf = mock<TemplatePdf>({
      customPersonalisationParameters: ['parameter_1'],
      addressLinePersonalisationParameters: [
        'address_line_1',
        'address_line_2',
        'address_line_3',
        'address_line_4',
        'address_line_5',
        'address_line_6',
        'address_line_7',
      ],
    });

    const csv = mock<TestDataCsv>({
      parameters: ['parameter_2'],
    });

    expect(validateLetterTemplateFiles(pdf, csv)).toBe(false);
  });

  test('returns false if csv has contains protected personalisation parameters', () => {
    const pdf = mock<TemplatePdf>({
      customPersonalisationParameters: ['parameter_1'],
      addressLinePersonalisationParameters: [
        'address_line_1',
        'address_line_2',
        'address_line_3',
        'address_line_4',
        'address_line_5',
        'address_line_6',
        'address_line_7',
      ],
    });

    const csv = mock<TestDataCsv>({
      parameters: ['fullName'],
    });

    expect(validateLetterTemplateFiles(pdf, csv)).toBe(false);
  });

  test('returns true if csv matches expected custom personalisation', () => {
    const pdf = mock<TemplatePdf>({
      customPersonalisationParameters: ['parameter_2', 'parameter_1'], // order not important
      addressLinePersonalisationParameters: [
        'address_line_1',
        'address_line_2',
        'address_line_3',
        'address_line_4',
        'address_line_5',
        'address_line_6',
        'address_line_7',
      ],
    });

    const csv = mock<TestDataCsv>({
      parameters: ['parameter_1', 'parameter_2'],
    });

    expect(validateLetterTemplateFiles(pdf, csv)).toBe(true);
  });
});
