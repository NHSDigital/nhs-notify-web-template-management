#!/usr/bin/env bash

set -euo pipefail  # safe scripting
clear

bin_dir="$(dirname "${BASH_SOURCE[0]}")"
test_dir="${bin_dir/bin/test}"

aws_account_id="$(aws sts get-caller-identity --query 'Account' --output text)"
project="$(echo ${*:-} | grep -Eo  "\-\-project ([a-z\-]*)" | awk '{print $2}')"
environment="$(echo ${*:-} | grep -Eo  "\-\-environment ([a-z\-]*)" | awk '{print $2}')"
component="$(echo ${*:-} | grep -Eo  "\-\-component ([a-z\-]*)" | awk '{print $2}')"
region="${AWS_DEFAULT_REGION:-eu-west-2}"

local_build_id="$(whoami)_$(hostname)"
build_id="${CI_PIPELINE_IID:-$local_build_id}"

${bin_dir}/terraform.sh ${*:-} --action "plan" --build-id "${build_id}" -- -lock=false

#MacOS Compatibility
if ! [ -x "$(command -v pip)" ] && [ -x "$(command -v pip3)" ]; then
  pip3 install --upgrade pip
fi

pip install terraform-compliance==1.3.48 --upgrade --quiet  # always upgrade to latest version

features_directory="${test_dir}/features"
local_file_to_test="${test_dir}/${component}_${build_id}.tfplan.json"

terraform-compliance \
  --features "${features_directory}" \
  --planfile "${local_file_to_test}"
