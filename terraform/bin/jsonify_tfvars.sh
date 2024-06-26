#!/usr/bin/env bash

set -euo pipefail

input_file="${1:-}"
output="${2:-json}"

if [[ -z "${input_file}" ]]; then
  echo "Pass a valid tfvars file"
  exit 1
fi

json_input="{"$( \
  cat ${input_file} | \
    sed -Eze 's/ = /:/g' \
    -e 's/,//' \
    -e 's/\n$//' \
    -e 's/\n/,/g' \
    -e 's/\s*#[^,]*,/,/g' \
    -e 's/,+/,/g' \
    -e 's/\[,/\[/g' \
    -e 's/\{,/\{/g' \
    -e 's/,\s*\]/\]/g' \
    -e 's/,\s*\}/\}/g' \
    -e 's/\-/_/g' \
)"}"

if [[ ${output} == "json" ]]; then
  jq --null-input -c "${json_input}"
else
  echo "${json_input}"
fi
