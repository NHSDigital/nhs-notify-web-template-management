#!/usr/bin/env bash

set -euo pipefail

function get_colour() {
  echo "$(git config --get-color "" "${1:-white} bold")"
}

color_yellow=$(get_colour yellow)
color_red="$(get_colour red)"
color_green="$(get_colour green)"
color_cyan="$(get_colour cyan)"
color_reset="$(git config --get-color "" "reset")"

component_name="${1:-no_component}"

if [ "${component_name}" == "no_component" ] || [ -f "./components/${component_name}" ]; then
  echo "Please provide a valid component"
fi

variables_file="./components/${component_name}/variables.tf"

#declare global or group vars here, it should be fairly infrequent that we would need to update these
declare mandatory_fields_but_global_group=(
  project
  region
  account_ids
  pipeline_overrides
)

#looking for all fields in the respective "variables.tf" file to find the ones that don't have a defaults set, hence making them mandatory
mandatory_fields=$(awk '/variable\s+"([^"]+)"\s\{/{p=1} p && /default\s+=/{p=0} p' RS= "$variables_file" | grep -E 'variable\s+"([^"]+)"\s+{' | sed -E 's/variable\s+"([^"]+)"\s+\{/\1/')

mandatory_not_in_global_group=()

#creating a list of fields that are not in the global or group tfvars list above already as we don't need to check those and want to focus on account/env specific tfvars
for i in ${mandatory_fields[@]}; do
  if [[ ! " ${mandatory_fields_but_global_group[@]} " =~ " $i " ]]; then
    mandatory_not_in_global_group+=("$i")
  fi
done

echo -e "${color_green}Checking for mandatory tfvars values in all global and group .tfvars files...${color_reset}"
generic_tfvars=(./etc/global.tfvars ./etc/group_target-env.tfvars ./etc/eu-west-2.tfvars)
merged_json=""

for tfvars_file in "${generic_tfvars[@]}"; do
  tfvars_global_json="$(./bin/jsonify_tfvars.sh ${tfvars_file})"
  merged_json="$merged_json$tfvars_global_json"
  echo -e "\n${color_yellow}${tfvars_file}${color_reset}"
done
merged_json=$(echo "$merged_json" | jq -s 'add')

for tfvars_field in ${mandatory_fields_but_global_group[@]}; do
    tfvars_value="$(jq '.'"${tfvars_field}" <<< ${merged_json})"
    if [[ "${tfvars_value}" != "null" ]]; then
      echo -e "${color_green}[  OK  ] ${color_cyan}${tfvars_field}${color_reset}"
    else
      echo -e "${color_red}[ FAIL ] ${color_cyan}${tfvars_field}${color_red} NOT FOUND IN TFVARS FILE!${color_reset}"
      exit 1
    fi
done

echo -e "${color_green}Checking for mandatory tfvars values in all .tfvars files...${color_reset}"

for tfvars_file in ./etc/env_eu-west-2_*; do
  tfvars_json="$(./bin/jsonify_tfvars.sh ${tfvars_file})"
  echo -e "\n${color_yellow}${tfvars_file}${color_reset}"
  for tfvars_field in ${mandatory_not_in_global_group[@]}; do
    tfvars_value="$(jq '.'"${tfvars_field}" <<< ${tfvars_json})"
    if [[ "${tfvars_value}" != "null" ]]; then
      echo -e "${color_green}[  OK  ] ${color_cyan}${tfvars_field}${color_reset}"
    else
      echo -e "${color_red}[ FAIL ] ${color_cyan}${tfvars_field}${color_red} NOT FOUND IN TFVARS FILE!${color_reset}"
      exit 1
    fi
  done
done



