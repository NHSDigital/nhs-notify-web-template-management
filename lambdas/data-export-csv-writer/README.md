# Data Export CSV Writer Lambda

Consumes messages from the `data-export` SQS queue and writes the `data` object contained in each message body to a CSV file in the `data-export` S3 bucket.

## Message Format

Each SQS message is expected to have a JSON body with a top-level `data` object, for example:

```json
{
  "eventType": "example.created",
  "data": {"id": 123, "name": "Example"},
  "meta": {"correlationId": "..."}
}
``

Only the `data` object is extracted; other fields are ignored.

## CSV Output

For a batch of messages the lambda produces one CSV file whose headers are the union of all keys across the collected `data` objects (first-seen order). A file name like:

```
exports/2025-11-06T12-00-00-000Z-abcdef12.csv
```

is written to the S3 bucket defined by the `BUCKET_NAME` environment variable (provisioned as `data-export`).

## Environment Variables

| Name        | Description                               |
|-------------|-------------------------------------------|
| BUCKET_NAME | Target S3 bucket for CSV files            |
| KEY_PREFIX  | Optional key prefix (defaults to exports/) |

## Building

From the repository root after installing workspaces:

```bash
npm install
npm run lambda-build --workspace lambdas/data-export-csv-writer
```

## Testing

```bash
npm run test:unit --workspace lambdas/data-export-csv-writer
```

## Deployment

Terraform defines:
* SQS queue & DLQ: `module.sqs_data_export`
* S3 bucket: `module.s3bucket_data_export`
* Lambda + Event Source Mapping: `module.lambda_data_export_csv_writer` + `aws_lambda_event_source_mapping.lambda_data_export_csv_writer`

Granting S3 write & SQS consume permissions is handled in the IAM policy document in `module_lambda_data_export_csv_writer.tf`.
