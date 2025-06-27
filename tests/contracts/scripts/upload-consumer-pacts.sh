#!/bin/bash
set -euo pipefail

script_path="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

consumer_dirs=("consumer" "consumer-2")
pact_dir="pacts"

VERSION_TAG=${PACT_VERSION:-$(git rev-parse --abbrev-ref HEAD)}

for consumer in "${consumer_dirs[@]}"; do
  consumer_pact_dir=$(realpath "${script_path}/../${consumer}/${pact_dir}")

  echo "Looking for pact files in $consumer_pact_dir..."

  for file in "$consumer_pact_dir"/*.json; do
    if [[ -f "$file" ]]; then
      # Extract consumer and provider names from filename
      filename=$(basename "$file")
      provider=$(cat $file | jq -r ".provider.name")

      # Define S3 target path
      targetPath="pacts/$provider/$filename"

      echo "Uploading to s3://$PACT_BUCKET/$targetPath"
      # aws s3 cp "$file" "s3://$PACT_BUCKET/$targetPath" --acl bucket-owner-full-control
    fi
  done
done

echo "All Pact files uploaded successfully."
