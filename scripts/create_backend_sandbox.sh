#!/bin/bash

set -euo pipefail

# expect 1 argument to the script
if [ $# -ne 1 ]; then
  echo 1>&2 "$0: expected 1 arguments, received $#"
  exit 2
fi

AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
AWS_REGION="eu-west-2"
PROJECT="nhs-notify"
GROUP="nhs-notify-template-management-nonprod"

identifier=$1

echo "Creating backend sandbox \"$identifier\""


cd $(git rev-parse --show-toplevel)/infrastructure/terraform

touch "$(pwd)/etc/group_$GROUP.tfvars" # tfscaffold doesn't seem to work properly without this file existing

./bin/terraform.sh \
  --project $PROJECT \
  --region $AWS_REGION \
  --component sandbox \
  --environment $identifier \
  --group $GROUP \
  --action apply \
  -- \
  -var aws_account_id=$AWS_ACCOUNT_ID \
  -var region=$AWS_REGION \
  -var project=$PROJECT \
  -var environment=$identifier \
  -var group=$GROUP


