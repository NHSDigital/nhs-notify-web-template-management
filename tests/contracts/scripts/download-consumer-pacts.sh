#!/bin/bash
set -euo pipefail

# Downloads all consumer-generated Pact contract files for a provider, for use in producer-side tests

script_path="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

provider="templates"

provider_dir=$(realpath "${script_path}/../tests/${provider}")

target_dir="${provider_dir}/provider/pacts"

echo "Downloading Pact files for provider: $provider"

mkdir -p "$target_dir"

aws s3 sync "s3://$PACT_BUCKET/pacts/$provider/" "$target_dir/" \
  --exclude "*" \
  --include "*.json"

echo "Pact files downloaded to $target_dir"
