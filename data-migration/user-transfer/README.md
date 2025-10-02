# User Transfer Data Migration

The purpose of this tool is to transfer templates stored in DynamoDB from a single user owner to the user's client.

This is a 2-stage process:

1. Plan (your migration)
2. Apply (your migration)

## Plan (your migration)

This creates a `transfer-plan-*.json` file in `./migrations` local directory and a copy in `main-acct-migration-backup/<environment>/transfer-plan-*/**` S3 bucket.

```bash
npm run plan -- \
    --environment "main" \
    --userPoolId "abc123" \
    --iamAccessKeyId "abc1234" \
    --iamSecretAccessKey "abc123" \
    --iamSessionToken "abc123"
```

### Parameters

| Parameter             | Optional | Description                                                                                    |
| --------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| --environment         | Required | The environment name, e.g. main                                                                |
| --userPoolId          | Required | This Cognito `UserPoolId` (if running in `sbx` then this can be your `sbx` Cognito userPoolId) |
| --iamAccessKeyId      | Optional | Access key id of the IAM account (dev/prod)                                                    |
| --iamSecretAccessKey  | Optional | Secret Access key of the IAM account (dev/prod)                                                |
| --iamSessionToken     | Optional | Session token of the IAM account (dev/prod)                                                    |

#### Why?

The `transfer-plan-*.json` is used to keep a record of the data that will be migrated to Client ownership.

## Apply (your migration)

Run the migration process for data stored in `transfer-plan-*.json`.

When doing a `dryRun=false` the data will be backed up:

1. transfers all user related files in `internal` S3 bucket
2. retrieves and stores all related DynamoDB data before executing

Backed-up data is stored `main-acct-migration-backup/<environment>/transfer-plan-*/**`

```bash
npm run apply -- \
    --environment "main" \
    --file "./migrations/file.json" \
    --dryRun "true"
```

The result of this script will output a file named the same as the input file but with `run/dryrun` appended to the name. This file is a record of what happened to each migration, whether it failed or passed and which stage the migration ended at.

### Parameters

| Parameter             | Optional | Description                                                                                    |
| --------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| --environment         | Required | The environment name, e.g. main                                                                |
| --file                | Required | The path of the `transfer-plan-*.json` file                                                    |
| --dryRun              | Optional | Defaults to `true`. When true will _not_ execute migration                                     |

## Authentication

You should establish a local AWS authentication session to the Templates (dev/prod) AWS account with sufficient permissions to read, write and delete template data from DynamoDB.

## Suggestions

When executing the migration it's a good idea to also write out the logs to a file. For example

```bash
npm run plan -- \
    --environment "main" \
    --file "./migrations/file.json" \
    --dryRun "false" >> migration.logs.txt
```

Then upload this log file to S3. This should then keep a decent record of _what_ happened during a migration.
