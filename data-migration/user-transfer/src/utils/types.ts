export type Parameters = {
  environment: string;
  component: string;
  accessKeyId: string;
  secretAccessKey: string;
  userPoolId: string;
  region: string;
  sessionToken: string;
  flag?: string;
};

export type UserData = {
  username: string;
  /*
   * extracted from the user's group starting with 'client:'
   */
  clientId: string;
  /*
   * extracted from the user's 'sub' attribute
   */
  userId: string;
};

export type Template = {
  id: string;
  owner: string;
};

type ToFrom = {
  from: string;
  to: string;
};

export type TransferStage =
  | 's3:copy'
  | 'ddb:transfer'
  | 's3:delete'
  | 'initial'
  | 'finished';

export type TransferStatus = 'success' | 'failed' | 'migrate';

export type UserTransferPlanItem = {
  templateId: string;
  status: TransferStatus;
  stage: TransferStage;
  reason?: string;
  ddb: {
    owner: ToFrom;
  };
  s3: {
    files: ToFrom[];
  };
};

export type UserTransferPlan = {
  total: number;
  tableName: string;
  bucketName: string;
  migrate: {
    count: number;
    plans: UserTransferPlanItem[];
  };
  orphaned: {
    count: number;
    templateIds: string[];
  };
};

export type UserTransferPlanItemResult = {
  success: boolean;
  stage: TransferStage;
  reasons?: string[];
};
