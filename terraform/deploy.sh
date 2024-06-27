#!/usr/bin/env bash
set -euo pipefail;

function get_colour() {
  echo "$(git config --get-color "" "${1:-white} bold")"
}

color_yellow=$(get_colour yellow)
color_red="$(get_colour red)"
color_white_on_red="$(get_colour 'white red')"
color_green="$(get_colour green)"
color_cyan="$(get_colour cyan)"
color_reset="$(git config --get-color "" "reset")"

# Set variables for later use
basedir="."
original_dir=$(pwd);
terraform_project="template-mgmt"
terraform_command=${1:-plan}

# shellcheck disable=SC1091
# shellcheck disable=SC2181
source "${basedir}/bin/progress.sh";

# Write out the required tfvars file so that terraform has access to the pipeline metadata...
show_progress 10 "Creating ${color_cyan}cicd tfvars file${color_reset}..." "color_red";
cd "${basedir}" || exit 1;
./bin/generate_target_env_tfvars.sh

# construct on-the-fly .tfvars file for dynamic environments
terraform_environment="${DEPLOY_ENVIRONMENT}";
component_list=$COMPONENT

# determine the order of components to process
if [[ "${TERRAFORM_ACTION}" == "destroy" ]]; then
  plan_action="plan-destroy";
else
  plan_action="plan";
fi;

base_progress=60;

# process the terraform components in order
for terraform_component in $component_list; do
  while [[ ${result:=1} != 0 ]]; do
    ((base_progress+=2));
    show_progress "${base_progress}" "Running Terraform ${color_cyan}${plan_action}${color_reset} on Component ${color_cyan}${terraform_component}${color_reset} in Environment ${color_cyan}${terraform_environment}${color_reset}..." "color_green";

    echo "Terraform command is ${terraform_command}"

    # The previous plan will be stale, so don't use it. Plan the destroy again.
    if [[ "${terraform_command}" == "plan" ]]; then
    ./bin/terrawrap.sh \
      --project "${terraform_project}" \
      --environment "${terraform_environment}" \
      --component "${terraform_component}" \
      --region "eu-west-2" \
      --group "target-env" \
      --action "${plan_action}" \
      --build-id "${CI_PIPELINE_IID}" \
    | tee "${terraform_component}_plan_output.txt"

    if [[ "$?" -ne 0 ]]; then
      echo -e "Terraform Plan failed. Aborting."
      exit 1
    fi

    # cp "${terraform_component}_plan_output.txt" ../ && cd .. #persisting plan output for next github step

    echo "plan_dir=$(pwd)" >> "$GITHUB_OUTPUT"

    fi

    if [[ "${terraform_command}" == "apply" ]]; then
      ((base_progress+=2));
      show_progress "${base_progress}" "Running Terraform ${color_cyan}${TERRAFORM_ACTION}${color_reset} on Component ${color_cyan}${terraform_component}${color_reset} in Environment ${color_cyan}${terraform_environment}${color_reset}..." "color_green";
      ./bin/terrawrap.sh \
        --project "${terraform_project}" \
        --environment "${terraform_environment}" \
        --component "${terraform_component}" \
        --region "eu-west-2" \
        --group "target-env" \
        --action "apply" \
        --build-id "${CI_PIPELINE_IID}" \
      | tee "${terraform_component}_${TERRAFORM_ACTION}_output.txt"
    fi

    # store the result
    result="$?";

  done;

  # if the destroy action ultimately failed, exit with error code
  if [[ "${result}" -ne 0 ]]; then
    echo "+++++ $(echo "${terraform_component}" | tr "[:lower:]" "[:upper:]") COMPONENT FAILED +++++";
    exit 1;
  fi;
done;


# write post-terraform facts to the pipeline json file...
cd "${original_dir}" || exit 1;

if [[ "${terraform_command}" == "apply" ]]; then
  show_progress 90 "Writing ${color_cyan}post-terraform facts${color_reset} to the pipeline json file..." "color_green";


deployment_account_id="$(jq -rc '.deployment_account_id.value' ${basedir}/${terraform_component}_output.json)"
echo "deployed_account=${deployment_account_id}" >> $GITHUB_OUTPUT

  show_progress 100 "${color_green}*** DEPLOYMENT COMPLETE ***${color_reset}" "color_green";
elif [[ "${terraform_command}" == "plan" ]]; then
  show_progress 90 "Writing ${color_cyan}Uploading artifacts from plan${color_reset} ..." "color_green";
fi

exit 0;
