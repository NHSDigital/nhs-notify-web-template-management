#!/bin/bash

set -euo pipefail

# feature flag
export NEXT_PUBLIC_ENABLE_LETTERS=true

export INCLUDE_AUTH_PAGES=true

templates_table_name=$(
  jq -r '.templates_table_name.value' "$(git rev-parse --show-toplevel)/sandbox_tf_outputs.json"
)

if [ "$templates_table_name" == "null" ]; then
  echo "Failed to determine templates table name" >&2
  exit 1
fi

export TEMPLATES_TABLE_NAME=$templates_table_name

npm run accessibility-test-setup

npm run build

npm run app:start --prefix frontend

npm run app:wait --prefix frontend

npm run test:accessibility

npm run accessibility-test-teardown
