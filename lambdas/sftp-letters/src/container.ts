import { S3Client } from '@aws-sdk/client-s3';
import { UserDataRepository } from './infra/user-data-repository';
import { defaultConfigReader } from 'nhs-notify-web-template-management-utils';
import { SSMClient } from '@aws-sdk/client-ssm';
import { SftpSupplierClientRepository } from './infra/sftp-supplier-client-repository';

export function createContainer() {
  const csi = defaultConfigReader.getValue('CSI');
  const internalBucketName = defaultConfigReader.getValue(
    'INTERNAL_BUCKET_NAME'
  );

  const s3Client = new S3Client({ region: 'eu-west-2' });

  const ssmClient = new SSMClient({ region: 'eu-west-2' });

  const userDataRepository = new UserDataRepository(
    s3Client,
    internalBucketName
  );

  const sftpSupplierClientRepository = new SftpSupplierClientRepository(
    csi,
    ssmClient
  );

  return { userDataRepository, sftpSupplierClientRepository };
}
