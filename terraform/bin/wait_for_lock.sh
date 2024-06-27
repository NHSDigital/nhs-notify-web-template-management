#!/usr/bin/env bash

###
# This script waits for the a terraform state lock to be free
###

set -euo pipefail  # safe scripting

declare red="\033[0;31m";
declare yellow="\033[0;33m";
declare cyan="\033[0;36m";
declare nc="\033[0m"; # No Color
declare bold="\033[1m";

wait_for_project="${1:-comms-pl}"
wait_for_component="${2:-acct}"
wait_for_env="${3:-acct-pl-mgmt}"
aws_account_id="$(aws sts get-caller-identity --query 'Account' --output text)"

# If a record is present in the DDB table then the environment state is locked.
# If there is no record (empty result) then the environment state is not locked.
function check_lock_status(){
  state_lock_content="$(aws dynamodb get-item \
    --table-name ${wait_for_project}-terraform-statelock \
    --key '{"LockID":{"S": "${wait_for_project}-tfscaffold-${aws_account_id}-eu-west-2/${wait_for_project}/${aws_account_id}/eu-west-2/${wait_for_env}/${wait_for_component}.tfstate"}}' \
    --output text)"

  if [[ "$?" -ne 0 ]]; then
    echo -e "${red}Failed to check state lock status for ${wait_for_env}${nc}";
    exit 1; # exit the script, rather than return a failure code, to ensure we don't get stuck in a loop
  fi;

  if [[ -n "${state_lock_content}" ]]; then
    return 1;
  else
    return 0;
  fi;
}

# check terraform_statelock table
while ! check_lock_status; do
  echo -e "${bold}${cyan}${wait_for_env} is currently locked! Waiting...${nc}";
  sleep 5s;
done;

echo -e "${yellow}${wait_for_env} is not locked! you may continue :)${nc}";
exit 0;
