import { LetterProofRepository } from '../../infra/letter-proof-repository';

describe('parseQuarantineKey', () => {
  test('parses key', () => {
    const parsedKey = LetterProofRepository.parseQuarantineKey(
      'proofs/supplier/template-id/proof.pdf'
    );

    expect(parsedKey).toEqual({
      templateId: 'template-id',
      fileName: 'proof.pdf',
      supplier: 'supplier',
    });
  });

  test('errors on wrong file extension', () => {
    expect(() =>
      LetterProofRepository.parseQuarantineKey(
        'proofs/supplier/template-id/proof.txt'
      )
    ).toThrow('Unexpected object key "proofs/supplier/template-id/proof.txt"');
  });

  test('errors on wrong number of path segments', () => {
    expect(() =>
      LetterProofRepository.parseQuarantineKey(
        'proofs/supplier/template-id/extra-folder/proof.pdf'
      )
    ).toThrow(
      'Unexpected object key "proofs/supplier/template-id/extra-folder/proof.pdf"'
    );
  });

  test('errors on wrong path prefix', () => {
    expect(() =>
      LetterProofRepository.parseQuarantineKey(
        'not-proofs/supplier/template-id/proof.pdf'
      )
    ).toThrow(
      'Unexpected object key "not-proofs/supplier/template-id/proof.pdf"'
    );
  });
});

test('getInternalKey', () => {
  expect(
    LetterProofRepository.getInternalKey(
      'template-owner',
      'template-id',
      'proof.pdf'
    )
  ).toEqual('proofs/template-owner/template-id/proof.pdf');
});
