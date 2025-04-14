export type SftpSupplierConfig = {
  host: string;
  username: string;
  privateKey: string;
  hostKey: string;
  baseUploadDir: string;
  baseDownloadDir: string;
};

export type ProofingRequest = {
  owner: string;
  templateId: string;
  pdfVersion: string;
  testDataVersion?: string;
  personalisationFields: string[];
};
