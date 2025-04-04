import { SQSRecord } from 'aws-lambda';
import { UserDataRepository } from '../infra/user-data-repository';
import { SftpSupplierClientRepository } from '../infra/sftp-supplier-client-repository';
import { z } from 'zod';

const $ProofRequest = z.object({});

function parseProofingRequest(event: Record<>) {}

export function createHandler({
  userDataRepository,
  sftpSupplierClientRepository,
}: {
  userDataRepository: UserDataRepository;
  sftpSupplierClientRepository: SftpSupplierClientRepository;
}) {
  return function (records: SQSRecord[]) {
    for (const record of records) {
      const body = record.body;
    }
  };
}
