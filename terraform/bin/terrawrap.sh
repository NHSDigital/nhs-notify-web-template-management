#!/usr/bin/env bash

# This utility summarises output from terraform for easy interpretation.
# It doesn't replace the terraform output logs - we still get all of that too (just scroll back a little).
# Simply use "./bin/terrawrap.sh" instead of "./bin/terraform.sh" and supply the usual scaffold params

set -e
set -o pipefail

function get_colour() {
  echo "$(git config --get-color "" "${1:-white} bold")"
}

bin_dir="$(dirname "${BASH_SOURCE[0]}")";
environment="$(echo ${*:-} | grep -Eo  "\-\-environment ([a-z0-9-]*)" | awk '{print $2}')";
component="$(echo ${*:-} | grep -Eo  "\-\-component ([a-z]*)" | awk '{print $2}')";
action="$(echo ${*:-} | grep -Eo  "\-\-action ([a-z]*)" | awk '{print $2}')";

# Create env file for dynamic env, after deleting an existing one if it does exist(happens locally)
if [[ "${environment}" =~ ^de-[a-zA-Z0-9_]{3,6}$ && -f "./etc/env_eu-west-2_${environment}.tfvars" ]]; then
  rm "./etc/env_eu-west-2_${environment}.tfvars"
fi
if [[ "${environment}" =~ ^de-[a-zA-Z0-9_]{3,6}$ && ! -f "./etc/env_eu-west-2_${environment}.tfvars" ]]; then
  echo "Creating dynamic environment ${environment}...";
  sed -e "s/DYNAMIC_ENVIRONMENT_NAME/${environment}/g" \
    "./etc/env_eu-west-2_dynamic_environments.tfvars" \
    > "./etc/env_eu-west-2_${environment}.tfvars";
fi;

color_yellow=$(get_colour yellow)
color_red="$(get_colour red)"
color_white_on_red="$(get_colour 'white red')"
color_green="$(get_colour green)"
color_cyan="$(get_colour cyan)"
color_reset="$(git config --get-color "" "reset")"

summary_file_tmp="${component,,}_${action}_output.tmp"
summary_file="${component,,}_${action}_output.txt"

${bin_dir}/terraform.sh ${*:-} 2>&1 | tee "${summary_file_tmp}"

cat "${summary_file_tmp}" | sed 's/\x1b\[[0-9;]*m//g' > "${summary_file}"
rm "${summary_file_tmp}"


# The following || true statements are necessary to avoid failing the pipeline if no tf changes are planned

if [[ "${action}" == "plan" ]]; then
echo -e "


${color_reset}$(printf "%.0s-" $(seq 1 100))${color_reset}
${color_cyan}${bold}[ ${component} ] Plan Summary >>>${color_reset}
${color_reset}$(printf "%.0s-" $(seq 1 100))${color_reset}

${color_green}CREATED:${color_reset}
$(grep -Pio ".*(?=will be created)" "${summary_file}" || true)

${color_yellow}UPDATED:${color_reset}
$(grep -Pio ".*(?=will be updated)" "${summary_file}" || true)

${color_red}REPLACED:${color_reset}
$(grep -Pio ".*(?=must be (.*)replaced)" "${summary_file}" || true)

${color_red}DESTROYED:${color_reset}
$(grep -Pio ".*(?=will be (.*)destroyed)" "${summary_file}" || true)

${color_white_on_red}ERRORS:${color_reset}
$(grep -Pio "(?<=Error: ).*" "${summary_file}" || true)

${color_reset}$(printf "%.0s-" $(seq 1 100))${color_reset}
"

elif [[ "${action}" == "apply" || "${action}" == "destroy" ]]; then
echo -e "


${color_reset}$(printf "%.0s-" $(seq 1 100))${color_reset}
${color_cyan}${bold}[ ${component} ] Apply Summary >>>${color_reset}
${color_reset}$(printf "%.0s-" $(seq 1 100))${color_reset}

${color_green}CREATED:${color_reset}
$(grep -Pio ".*(?=: Creation complete)" "${summary_file}" || true)

${color_yellow}MODIFIED:${color_reset}
$(grep -Pio ".*(?=: Modifications complete)" "${summary_file}" || true)

${color_red}DESTROYED:${color_reset}
$(grep -Pio ".*(?=: Destruction complete)" "${summary_file}" || true)

${color_white_on_red}ERRORS:${color_reset}
$(grep -Pio "(?<=Error: ).*" "${summary_file}" || true)

${color_reset}$(printf "%.0s-" $(seq 1 100))${color_reset}
"

else
  exit 0;
fi;
