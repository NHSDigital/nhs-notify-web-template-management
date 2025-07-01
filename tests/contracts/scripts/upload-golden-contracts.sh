#!/bin/bash
set -euo pipefail

script_path="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";
src_root="$( realpath "${script_path}/../src" )"

find "${src_root}" -type f -path "*/events/.schemas/*.schema.json" | while read -r filepath; do
  relative_path="${filepath#$src_root/}"
  provider="${relative_path%%/*}"

  s3_path="s3://$PACT_BUCKET/golden/$provider/$(basename "$filepath")"

  echo "Uploading $filepath to $s3_path"
  aws s3 cp "$filepath" "$s3_path"
done

echo "Uploaded all golden contracts to s3"
