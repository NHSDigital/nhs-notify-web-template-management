import { mockDeep } from 'jest-mock-extended';
import {
  PreTransformationTemplateSavedDataFields,
  transformProofsObjectToSuppliersList,
} from '../../domain/output-schemas';

test('does not transform non-letter events', () => {
  const input = mockDeep<PreTransformationTemplateSavedDataFields>({
    templateType: 'EMAIL',
  });

  const output = transformProofsObjectToSuppliersList(input);

  expect(output).toEqual(input);
});

test('transforms when no proofs object is present', () => {
  const input = mockDeep<
    Extract<
      PreTransformationTemplateSavedDataFields,
      { templateType: 'LETTER' }
    >
  >({
    templateType: 'LETTER',
    files: {
      proofs: undefined,
    },
  });

  const output = transformProofsObjectToSuppliersList(input);

  const { files: _, ...otherFields } = input;

  expect(output).toEqual({ ...otherFields, suppliers: [] });
});

test('transforms when proofs object is present', () => {
  const input = mockDeep<
    Extract<
      PreTransformationTemplateSavedDataFields,
      { templateType: 'LETTER' }
    >
  >({
    templateType: 'LETTER',
    files: {
      pdfTemplate: {
        currentVersion: 'current-version',
        fileName: 'file-name',
        virusScanStatus: 'PASSED',
      },
      proofs: {
        proof1: {
          supplier: 'WTMMOCK',
          fileName: 'file-name',
          virusScanStatus: 'PASSED',
        },
      },
    },
  });

  const output = transformProofsObjectToSuppliersList(input);

  const { files: _, ...otherFields } = input;

  expect(output).toEqual({ ...otherFields, suppliers: ['WTMMOCK'] });
});
