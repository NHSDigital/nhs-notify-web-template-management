#!/bin/bash

set -euo pipefail

# expect 1 argument to the script
if [ $# -ne 1 ]; then
  echo 1>&2 "$0: expected 1 arguments, received $#"
  exit 2
fi

GROUP="nhs-notify-template-management-nonprod"
AWS_REGION="eu-west-2" # make dynamic?
identifier=$1

echo "Creating backend sandbox \"$identifier\""


cd $(git rev-parse --show-toplevel)/infrastructure/terraform

./bin/terraform.sh \
  --project nhs-notify \
  --region $AWS_REGION \
  --component sandbox \
  --environment $identifier \
  --group $GROUP \
  --action apply \
  -- \
  -var-file="$(pwd)/etc/sandbox.tfvars" \
  -var environment=$identifier

