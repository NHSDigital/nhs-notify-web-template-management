import { LetterProofRepository } from '../../../templates/infra/letter-proof-repository';

describe('parseQuarantineKey', () => {
  test('parses key', () => {
    const parsedKey = LetterProofRepository.parseQuarantineKey(
      'proofs/template-id/proof.pdf'
    );

    expect(parsedKey).toEqual({
      templateId: 'template-id',
      fileName: 'proof',
    });
  });

  test('errors on wrong file extension', () => {
    expect(() =>
      LetterProofRepository.parseQuarantineKey('proofs/template-id/proof.txt')
    ).toThrow('Unexpected object key "proofs/template-id/proof.txt"');
  });

  test('errors on wrong number of path segments', () => {
    expect(() =>
      LetterProofRepository.parseQuarantineKey(
        'proofs/template-id/extra-folder/proof.pdf'
      )
    ).toThrow(
      'Unexpected object key "proofs/template-id/extra-folder/proof.pdf"'
    );
  });

  test('errors on wrong path prefix', () => {
    expect(() =>
      LetterProofRepository.parseQuarantineKey(
        'not-proofs/template-id/proof.pdf'
      )
    ).toThrow('Unexpected object key "not-proofs/template-id/proof.pdf"');
  });
});

test('getInternalKey', () => {
  expect(
    LetterProofRepository.getInternalKey(
      'template-owner',
      'template-id',
      'proof'
    )
  ).toEqual('proofs/template-owner/template-id/proof.pdf');
});
