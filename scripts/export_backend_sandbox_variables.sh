#!/bin/bash

set -euo pipefail

root_dir=$(git rev-parse --show-toplevel)
json_file="${root_dir}/sandbox_tf_outputs.json"

# Read and export each value
export TEMPLATE_STORAGE_TABLE_NAME=$(jq -r '.dynamodb_table_templates.value' "$json_file")
export NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=$(jq -r '.cognito_user_pool_client_id.value' "$json_file")
export NEXT_PUBLIC_COGNITO_USER_POOL_ID=$(jq -r '.cognito_user_pool_id.value' "$json_file")
