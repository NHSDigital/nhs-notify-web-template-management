export type SftpSupplierConfig = {
  host: string;
  username: string;
  privateKey: string;
  hostKey: string;
  baseUploadDir: string;
  baseDownloadDir: string;
};
