#!/bin/bash

set -euo pipefail

DEFAULT_TABLE_NAME="nhs-notify-miha12-sbx-api-templates"
DEFAULT_BUCKET_NAME="nhs-notify-891377170468-eu-west-2-miha12-sbx-quarantine"
DEFAULT_REGION="eu-west-2"

usage() {
  cat <<EOF
Usage:
  $0 --scenario <pass|fail>

Options:
  --scenario <pass|fail>     Required. pass uploads a clean fixture docx, fail uploads EICAR payload.
  -h, --help                 Show this help.

Example:
  $0 --scenario pass
  $0 --scenario fail
EOF
}

SCENARIO=""
TEMPLATE_ID=""
VERSION_ID=""
TEMPLATE_NAME="Virus scan test template"
TABLE_NAME="$DEFAULT_TABLE_NAME"
BUCKET_NAME="$DEFAULT_BUCKET_NAME"
REGION="$DEFAULT_REGION"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --scenario)
      SCENARIO="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 2
      ;;
  esac
done

if [[ "$SCENARIO" != "pass" && "$SCENARIO" != "fail" ]]; then
  echo "--scenario must be one of: pass, fail" >&2
  usage
  exit 2
fi

ROOT_DIR=$(git rev-parse --show-toplevel)
CLIENT_ID="8bfed278-fd56-44c2-9a67-d12e38979714"

if [[ -z "$TEMPLATE_ID" ]]; then
  TEMPLATE_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
fi

if [[ -z "$VERSION_ID" ]]; then
  VERSION_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
fi

NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
OWNER="CLIENT#${CLIENT_ID}"
FILE_NAME="${VERSION_ID}.docx"
S3_KEY="docx-template/${CLIENT_ID}/${TEMPLATE_ID}/${FILE_NAME}"

tmp_item_file=$(mktemp)
tmp_upload_file=""

cleanup() {
  rm -f "$tmp_item_file"
  if [[ -n "$tmp_upload_file" ]]; then
    rm -f "$tmp_upload_file"
  fi
}
trap cleanup EXIT

cat > "$tmp_item_file" <<EOF
{
  "id": {"S": "${TEMPLATE_ID}"},
  "owner": {"S": "${OWNER}"},
  "version": {"N": "1"},
  "templateType": {"S": "LETTER"},
  "letterVersion": {"S": "AUTHORING"},
  "templateStatus": {"S": "PENDING_VALIDATION"},
  "name": {"S": "${TEMPLATE_NAME}"},
  "language": {"S": "en"},
  "letterType": {"S": "x0"},
  "sidesCount": {"N": "1"},
  "clientId": {"S": "${CLIENT_ID}"},
  "createdAt": {"S": "${NOW}"},
  "updatedAt": {"S": "${NOW}"},
  "lockNumber": {"N": "0"},
  "files": {
    "M": {
      "docxTemplate": {
        "M": {
          "currentVersion": {"S": "${VERSION_ID}"},
          "fileName": {"S": "${FILE_NAME}"},
          "virusScanStatus": {"S": "PENDING"}
        }
      }
    }
  }
}
EOF

echo "Seeding DynamoDB item"
aws dynamodb put-item \
  --region "$REGION" \
  --table-name "$TABLE_NAME" \
  --item "file://${tmp_item_file}" \
  --condition-expression "attribute_not_exists(#id) AND attribute_not_exists(#owner)" \
  --expression-attribute-names '{"#id":"id","#owner":"owner"}'

echo
echo "DynamoDB item inserted."
echo "DynamoDB keys: id=${TEMPLATE_ID}, owner=${OWNER}"
read -r -p "Press Enter to continue with S3 upload..."

if [[ "$SCENARIO" == "pass" ]]; then
  upload_file_path="$ROOT_DIR/tests/test-team/fixtures/letters/docx/standard-english-template.docx"

  if [[ ! -f "$upload_file_path" ]]; then
    echo "Required file not found: $upload_file_path" >&2
    exit 1
  fi

  echo "Uploading clean DOCX for PASS scenario..."
else
  tmp_upload_file=$(mktemp)
  printf '%s' 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > "$tmp_upload_file"
  upload_file_path="$tmp_upload_file"
  echo "Uploading EICAR payload for FAIL scenario..."
fi

aws s3api put-object \
  --region "$REGION" \
  --bucket "$BUCKET_NAME" \
  --key "$S3_KEY" \
  --body "$upload_file_path" \
  --content-type "application/vnd.openxmlformats-officedocument.wordprocessingml.document" \
  --metadata "file-type=docx-template,client-id=${CLIENT_ID},template-id=${TEMPLATE_ID},version-id=${VERSION_ID}"

echo
echo "Done."
echo "S3 key:       $S3_KEY"
