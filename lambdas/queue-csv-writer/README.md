# queue-csv-writer Lambda

Consumes messages from the `event-csv` SQS queue and writes the `data` object from each message body to a CSV file in the `event-csv` S3 bucket.

## Behaviour
- Expects each SQS message body to be JSON containing a top-level `data` object.
- Builds a header row from the union of all keys across received `data` objects (sorted alphabetically).
- Escapes values per RFC4180 rules (quotes, commas, new lines).
- Uploads the CSV to `s3://$EVENT_CSV_BUCKET_NAME/events/<ISO_TIMESTAMP>.csv`.
- Returns `{ status: 'ok' }` or `{ status: 'no-data' }` when no rows were produced.

## Environment Variables
- `EVENT_CSV_BUCKET_NAME` – bucket to upload CSV files (injected by Terraform).

## Build

```bash
npm run lambda-build
```

## Test

```bash
npm run test:unit
```

## Notes
- IAM policy grants minimal SQS consume & S3 PutObject permissions.
- DLQ is created by the SQS module for poison messages.
