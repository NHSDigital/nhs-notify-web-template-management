#!/usr/bin/env bash

set -euo pipefail

env_type=""
environment="${2:-none}"

if [ "${environment:0:3}" == "de-" ]; then
  env_type="dynamic_environments"
else
  env_type="${2:-internal-dev}"
fi


# Write out the required tfvars file so that terraform has access to the pipeline metadata...
target_env_tfvars="./etc/group_target-env.tfvars";

cat << EOF > "${target_env_tfvars}"
  pipeline_overrides = "$(jq -nrc '$ENV | with_entries(select(.key | match("OVR_")))' | tr -d '\n' | sed 's/"/\\"/g' )"
EOF

terraform fmt ${target_env_tfvars}

exit 0
