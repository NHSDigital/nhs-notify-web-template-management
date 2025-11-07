/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'node:fs';
import path from 'node:path';
import { TemplatePdf } from '../../domain/template-pdf';

test('has the given key attributes', () => {
  const pdf = new TemplatePdf(
    {
      templateId: 'template-id',
      clientId: 'template-owner',
    },
    Uint8Array.from('')
  );

  expect(pdf.templateId).toBe('template-id');
  expect(pdf.clientId).toBe('template-owner');
});

test('parse with no custom personalisation', async () => {
  const file = fs.readFileSync(
    path.resolve(__dirname, '../fixtures/no-custom-personalisation.pdf')
  );
  const pdf = new TemplatePdf(
    {
      templateId: 'template-id',
      clientId: 'template-owner',
    },
    new Uint8Array(file)
  );
  await pdf.parse();

  expect(pdf.personalisationParameters).toEqual([
    'address_line_1',
    'address_line_2',
    'address_line_3',
    'address_line_4',
    'address_line_5',
    'address_line_6',
    'address_line_7',
    'firstName',
    'date',
  ]);

  expect(pdf.defaultPersonalisationParameters).toEqual([
    'address_line_1',
    'address_line_2',
    'address_line_3',
    'address_line_4',
    'address_line_5',
    'address_line_6',
    'address_line_7',
    'firstName',
    'date',
  ]);

  expect(pdf.customPersonalisationParameters).toEqual([]);

  expect(pdf.addressLinePersonalisationParameters).toEqual([
    'address_line_1',
    'address_line_2',
    'address_line_3',
    'address_line_4',
    'address_line_5',
    'address_line_6',
    'address_line_7',
  ]);
});

test('parse with custom personalisation', async () => {
  const file = fs.readFileSync(
    path.resolve(__dirname, '../fixtures/custom-personalisation.pdf')
  );
  const pdf = new TemplatePdf(
    {
      templateId: 'template-id',
      clientId: 'template-owner',
    },
    new Uint8Array(file)
  );
  await pdf.parse();

  expect(pdf.personalisationParameters).toEqual([
    'address_line_1',
    'address_line_2',
    'address_line_3',
    'address_line_4',
    'address_line_5',
    'address_line_6',
    'address_line_7',
    'date',
    'nhsNumber',
    'fullName',
    'appointment_date',
    'appointment_time',
    'appointment_location',
    'contact_telephone_number',
  ]);

  expect(pdf.defaultPersonalisationParameters).toEqual([
    'address_line_1',
    'address_line_2',
    'address_line_3',
    'address_line_4',
    'address_line_5',
    'address_line_6',
    'address_line_7',
    'date',
    'nhsNumber',
    'fullName',
  ]);

  expect(pdf.customPersonalisationParameters).toEqual([
    'appointment_date',
    'appointment_time',
    'appointment_location',
    'contact_telephone_number',
  ]);

  expect(pdf.addressLinePersonalisationParameters).toEqual([
    'address_line_1',
    'address_line_2',
    'address_line_3',
    'address_line_4',
    'address_line_5',
    'address_line_6',
    'address_line_7',
  ]);
});

test('errors if parse is not called before reading personalisation', () => {
  const file = fs.readFileSync(
    path.resolve(__dirname, '../fixtures/no-custom-personalisation.pdf')
  );
  const pdf = new TemplatePdf(
    {
      templateId: 'template-id',
      clientId: 'template-owner',
    },
    file
  );

  expect(() => pdf.personalisationParameters).toThrow(
    'PDF has not been parsed'
  );
  expect(() => pdf.defaultPersonalisationParameters).toThrow(
    'PDF has not been parsed'
  );
  expect(() => pdf.customPersonalisationParameters).toThrow(
    'PDF has not been parsed'
  );
  expect(() => pdf.addressLinePersonalisationParameters).toThrow(
    'PDF has not been parsed'
  );
});

test('errors if file cannot be parsed', async () => {
  const file = fs.readFileSync(
    path.resolve(__dirname, '../fixtures/test-data.csv')
  );

  const pdf = new TemplatePdf(
    {
      templateId: 'template-id',
      clientId: 'template-owner',
    },
    file
  );

  await expect(pdf.parse()).rejects.toThrow();
});

test('errors if file cannot be opened', async () => {
  const file = fs.readFileSync(
    path.resolve(__dirname, '../fixtures/password.pdf')
  );

  const pdf = new TemplatePdf(
    {
      templateId: 'template-id',
      clientId: 'template-owner',
    },
    file
  );

  await expect(pdf.parse()).rejects.toThrow();
});
