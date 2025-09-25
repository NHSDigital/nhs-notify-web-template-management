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

export type Template = {
  id: string;
  owner: string;
};

type ToFrom = {
  from: string;
  to: string;
};

export type MigrationStage =
  | 's3:copy'
  | 'ddb:transfer'
  | 's3:delete'
  | 'initial'
  | 'finished';

export type MigrationStatus = 'success' | 'failed' | 'migrate';

export type MigrationPlanItem = {
  templateId: string;
  status: MigrationStatus;
  stage: MigrationStage;
  reason?: string;
  ddb: {
    owner: ToFrom;
  };
  s3: {
    files: ToFrom[];
  };
};

export type MigrationPlan = {
  total: number;
  tableName: string;
  bucketName: string;
  run: number;
  migrate: {
    count: number;
    plans: MigrationPlanItem[];
  };
  orphaned: {
    count: number;
    templateIds: string[];
  };
};

export type MigrationPlanItemResult = {
  success: boolean;
  stage: MigrationStage;
  reasons?: string[];
};
