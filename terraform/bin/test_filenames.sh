#!/usr/bin/env bash
set -uo pipefail

function get_colour() {
  echo "$(git config --get-color "" "${1:-white} ")"
}

bin_dir="$(dirname "${BASH_SOURCE[0]}")";
component="$(echo ${*:-} | grep -Eo  "\-\-component ([a-z]*)" | awk '{print $2}')";
action="$(echo ${*:-} | grep -Eo  "\-\-action ([a-z]*)" | awk '{print $2}')";

color_yellow=$(get_colour yellow)
color_red="$(get_colour red)"
color_white_on_red="$(get_colour 'white red')"
color_green="$(get_colour green)"
color_cyan="$(get_colour cyan)"
color_magenta="$(get_colour magenta)"
color_reset="$(git config --get-color "" "reset")"

if [[ "$(uname)" == "Darwin" ]]; then
  sed_type="gsed"
else
  sed_type="sed"
fi

list_of_files=$(find . -name '*.tf' -not -path "*/bootstrap/*")
failed_count=0

clear
echo -e "\nChecking ${color_yellow}.tf${color_reset} file names against project standards..."
echo -e "actual_name expected_name type" | awk '{printf "\n%-80s %-60s %s\n", $1, $2, $3}'

for file in $list_of_files; do
  echo -n "${color_green}"
  file_name_checker_ignore="$(head -n 1 "${file}" | grep '#@filename_check_ignore')"
  if [[ -n "${file_name_checker_ignore}" ]]; then
    echo "${file}" | awk '{printf "%-140s  (ignored)\n", $1}'
    continue
  fi
  echo -n "${color_reset}"

  echo -n "${color_yellow}"
  top_resource="$(head -n 3 "${file}" | grep 'resource ".*"')"
  if [[ $? -eq 0 ]]; then
    resource_type="$(echo "${top_resource}" | ${sed_type} -E 's/.*\"(aws_|awscc_)?(.*)\"\s\"(.*)\".*/\2/')"
    resource_name="$(echo "${top_resource}" | ${sed_type} -E 's/.*\"(aws_|awscc_)?(.*)\"\s\"(.*)\".*/\3/')"
    expected_file_name="${resource_type}_${resource_name}.tf"
    actual_file_name="$(basename "${file}")"

    if [[ "${expected_file_name}" != "${actual_file_name}" ]]; then
      echo -e "${file} ${expected_file_name}" | awk '{printf "%-80s %-60s (resource)\n", $1, $2}'
      ((failed_count+=1))
    fi
    continue
  fi
  echo -n "${color_reset}"


  echo -n "${color_cyan}"
  top_resource="$(head -n 3 "${file}" | grep 'data ".*"')"
  if [[ $? -eq 0 ]]; then
    resource_type="$(echo "${top_resource}" | ${sed_type} -E 's/.*\"(aws_|awscc_)?(.*)\"\s\"(.*)\".*/\2/')"
    resource_name="$(echo "${top_resource}" | ${sed_type} -E 's/.*\"(aws_|awscc_)?(.*)\"\s\"(.*)\".*/\3/')"
    expected_file_name="data_${resource_type}_${resource_name}.tf"
    actual_file_name="$(basename "${file}")"

    if [[ "${expected_file_name}" != "${actual_file_name}" ]]; then
      echo -e "${file} ${expected_file_name}" | awk '{printf "%-80s %-60s (data)\n", $1, $2}'
      ((failed_count+=1))
    fi
    continue
  fi
  echo -n "${color_reset}"


  echo -n "${color_magenta}"
  top_resource="$(head -n 3 "${file}" | grep 'module ".*"')"
  if [[ $? -eq 0 ]]; then
    resource_type="module"
    resource_name="$(echo "${top_resource}" | ${sed_type} -E 's/.*module\s\"(.*)\".*/\1/')"
    expected_file_name="${resource_type}_${resource_name}.tf"
    actual_file_name="$(basename "${file}")"

    if [[ "${expected_file_name}" != "${actual_file_name}" ]]; then
      echo -e "${file} ${expected_file_name}" | awk '{printf "%-80s %-60s (module)\n", $1, $2}'
      ((failed_count+=1))
    fi
    continue
  fi
  echo -n "${color_reset}"
done

echo -n ""
echo -e "\n${color_red}Total failed = ${failed_count}${color_reset}\n"

if [[ failed_count -gt 0 ]]; then
  exit 1
else
  exit 0
fi
