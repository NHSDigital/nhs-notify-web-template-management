import { defaultConfigReader as reader } from 'nhs-notify-web-template-management-utils';

export function loadConfig() {
  return {
    csi: reader.getValue('CSI'),
    internalBucketName: reader.getValue('INTERNAL_BUCKET_NAME'),
    defaultSupplier: reader.getValue('DEFAULT_LETTER_SUPPLIER'),
    sftpEnvironment: reader.getValue('SFTP_ENVIRONMENT'),
    region: reader.getValue('REGION'),
  };
}
